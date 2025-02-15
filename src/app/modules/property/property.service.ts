import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import Property from './property.model';
import config from '../../../config';
import { TProperty } from './property.interface';
import { User } from '../user/user.model';
import {
  sortReservationsByCreatedBy,
  sortReservationsByDates,
} from './property.utils';

export const fetchFromApi = async (url: string, body?: URLSearchParams) => {
  console.log(url);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': config.we_book_api_key!,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  return response.json();
};

export const getAllRooms = async () => {
  return fetchFromApi('https://kapi.wubook.net/kp/property/fetch_rooms');
};

const getAllReservations = async (
  filters: {
    arrival?: { from: string; to: string };
    departure?: { from: string; to: string };
    pager?: { limit: number; offset: number };
  } = {
    arrival: {
      from: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toLocaleDateString('en-GB'),
      to: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).toLocaleDateString('en-GB'),
    },
    departure: {
      from: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toLocaleDateString('en-GB'),
      to: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).toLocaleDateString('en-GB'),
    },
    pager: { limit: 64, offset: 0 },
  }
) => {
  if (filters.departure && filters.arrival) {
    const departureToDate = new Date(
      filters.departure.to.split('/').reverse().join('-')
    );
    filters.departure.to = new Date(
      departureToDate.getFullYear(),
      departureToDate.getMonth() + 4,
      0
    ).toLocaleDateString('en-GB');

    const departureFromDate = new Date(
      filters.departure.from.split('/').reverse().join('-')
    );
    filters.departure.from = new Date(
      departureFromDate.getFullYear(),
      departureFromDate.getMonth() - 1,
      0
    ).toLocaleDateString('en-GB');
    const arrivalToDate = new Date(
      filters.arrival.to.split('/').reverse().join('-')
    );
    filters.arrival.to = new Date(
      arrivalToDate.getFullYear(),
      arrivalToDate.getMonth() + 1,
      0
    ).toLocaleDateString('en-GB');

    const arrivalFromDate = new Date(
      filters.arrival.from.split('/').reverse().join('-')
    );
    filters.arrival.from = new Date(
      arrivalFromDate.getFullYear(),
      arrivalFromDate.getMonth() - 3,
      0
    ).toLocaleDateString('en-GB');
  }
  console.log(filters);
  return fetchFromApi(
    'https://kapi.wubook.net/kp/reservations/fetch_reservations',
    new URLSearchParams({ filters: JSON.stringify(filters) })
  );
};

////////////////////////
const getAllReservationByCreatedTime = async (
  filters: {
    created?: { from: string; to: string };
    pager?: { limit: number; offset: number };
  } = {
    created: {
      from: new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 1,
        0
      ).toLocaleDateString('en-GB'),
      to: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).toLocaleDateString('en-GB'),
    },
    pager: { limit: 64, offset: 0 },
  }
) => {
  if (filters.created) {
    const createdToDate = new Date(
      filters.created.to.split('/').reverse().join('-')
    );
    filters.created.to = new Date(
      createdToDate.getFullYear(),
      createdToDate.getMonth() + 1,
      0
    ).toLocaleDateString('en-GB');

    const createdFromDate = new Date(
      filters.created.from.split('/').reverse().join('-')
    );
    filters.created.from = new Date(
      createdFromDate.getFullYear(),
      createdFromDate.getMonth() - 6,
      1
    ).toLocaleDateString('en-GB');
  }
  console.log(filters);
  return fetchFromApi(
    'https://kapi.wubook.net/kp/reservations/fetch_reservations',
    new URLSearchParams({ filters: JSON.stringify(filters) })
  );
};

/////////////////////////////////////
export const getCustomerById = async (customerId: string) =>
  fetchFromApi(
    'https://kapi.wubook.net/kp/customers/fetch_one',
    new URLSearchParams({ id: customerId })
  );

export const getNotesByRCode = async (rcode: string) =>
  fetchFromApi(
    'https://kapi.wubook.net/kapi/notes/get_notes',
    new URLSearchParams({ rcode })
  );

const getReservationsByOwnerId = async (
  ownerId: string,
  query: { startDate: string; endDate: string; offset: number }
) => {
  const data = await getAllRooms();

  const [properties, allRooms, reservations] = await Promise.all([
    Property.find({ owner: ownerId }).select('zakRoomId'),
    getAllRooms(),

    getAllReservations({
      arrival: { from: query.startDate, to: query.endDate },
      departure: { from: query.startDate, to: query.endDate },
      pager: { limit: 128, offset: query.offset },
    }),
  ]);

  const propertyWithRoomIds = properties.map(property => property.zakRoomId);
  const allReservations = reservations?.data?.reservations;

  const reservationsForOwner = allReservations?.filter((reservation: any) =>
    reservation.rooms?.some((room: any) =>
      propertyWithRoomIds.includes(room.id_zak_room?.toString())
    )
  );
  return Promise.all(
    properties.map(async property => {
      const roomReservations = await Promise.all(
        reservationsForOwner
          ?.filter((reservation: any) =>
            reservation.rooms?.some(
              (room: any) => room.id_zak_room?.toString() === property.zakRoomId
            )
          )
          ?.map(async (reservation: any) => {
            const [customer, notes] = await Promise.all([
              getCustomerById(reservation.rooms[0]?.customers[0]?.id),
              getNotesByRCode(reservation?.id_human),
            ]);
            return {
              ...reservation,
              customerName: `${customer?.data?.main_info?.name} ${customer?.data?.main_info?.surname}`,

              customerPhone: customer?.data?.contacts?.phone || 'Unknown',
              notes: notes?.data,
            };
          }) ?? []
      );

      const room = allRooms?.data?.find(
        (room: any) => room.id?.toString() === property.zakRoomId
      );

      return {
        ...property.toObject(),
        roomName: room ? room.name : 'Unknown',
        reservations: roomReservations,
      };
    })
  );
};
//getReservationsForAdmin
const getReservationsForAdmin = async (query: {
  startDate: string;
  endDate: string;
  offset: number;
}) => {
  const [properties, allRooms, reservations] = await Promise.all([
    Property.find({}).select('zakRoomId'),
    getAllRooms(),
    getAllReservations({
      arrival: { from: query.startDate, to: query.endDate },
      departure: { from: query.startDate, to: query.endDate },
      pager: { limit: 64, offset: query.offset || 0 },
    }),
  ]);

  const allReservations = reservations?.data?.reservations;

  return Promise.all(
    properties.map(async property => {
      const roomReservations = await Promise.all(
        allReservations
          ?.filter((reservation: any) =>
            reservation.rooms?.some(
              (room: any) =>
                room?.id_zak_room?.toString() === property.zakRoomId
            )
          )
          ?.map(async (reservation: any) => {
            const [customer, notes] = await Promise.all([
              getCustomerById(reservation.rooms[0]?.customers[0]?.id),
              getNotesByRCode(reservation?.id_human),
            ]);

            return {
              ...reservation,
              customerName: `${customer?.data?.main_info?.name} ${customer?.data?.main_info?.surname}`,

              customerPhone: customer?.data?.contacts?.phone || 'Unknown',
              notes: notes?.data,
            };
          }) ?? []
      );

      const room = allRooms?.data?.find(
        (room: any) => room.id?.toString() === property.zakRoomId
      );
      return {
        ...property.toObject(),
        roomName: room ? room.name : 'Unknown',
        reservations: roomReservations,
      };
    })
  );
};
//getReservationsByRoomId
const getReservationsByRoomId = async (
  room_id: string,
  query: { startDate: string; endDate: string; offset: number }
) => {
  const roomRes = await Property.findById(room_id).select('zakRoomId');

  const roomId = roomRes?.zakRoomId;
  const allRooms = await getAllRooms();
  const room = allRooms?.data?.find(
    (room: any) => room.id?.toString() === roomId
  );

  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }
  const finalReservation = [];
  let offset = query.offset || 0;
  let hasMore = true;

  while (hasMore) {
    const reservations = await getAllReservations({
      arrival: { from: query.startDate, to: query.endDate },
      departure: { from: query.startDate, to: query.endDate },
      pager: { limit: 64, offset },
    });

    const allReservations = reservations?.data?.reservations;
    finalReservation.push(...allReservations);

    if (allReservations.length < 64) {
      hasMore = false;
    } else {
      offset += 64;
    }
  }

  const roomReservations = finalReservation?.filter((reservation: any) =>
    reservation.rooms?.some(
      (room: any) => room.id_zak_room?.toString() === roomId
    )
  );

  const detailedReservations = await Promise.all(
    roomReservations?.map(async (reservation: any) => {
      const [customer, notes] = await Promise.all([
        getCustomerById(reservation.rooms[0]?.customers[0]?.id),
        getNotesByRCode(reservation?.id_human),
      ]);

      return {
        ...reservation,
        customerName: `${customer?.data?.main_info?.name} ${customer?.data?.main_info?.surname}`,

        customerPhone: customer?.data?.contacts?.phone || 'Unknown',
        notes: notes?.data,
      };
    }) ?? []
  );

  const sortedReservations = sortReservationsByDates(
    detailedReservations,
    parseInt(roomId!),
    query
  );

  return {
    roomName: room.name,
    room_id: room.id,
    reservations: sortedReservations,
  };
};
//////////////////////////////////////////
export const getReservationsByRoomIdByCreatedTime = async (
  room_id: string,
  query: { startDate: string; endDate: string; offset: number }
) => {
  const roomRes = await Property.findById(room_id).select('zakRoomId');

  const roomId = roomRes?.zakRoomId;
  const allRooms = await getAllRooms();
  const room = allRooms?.data?.find(
    (room: any) => room.id?.toString() === roomId
  );

  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }
  const finalReservation = [];
  let offset = query.offset || 0;
  let hasMore = true;

  while (hasMore) {
    const reservations = await getAllReservationByCreatedTime({
      created: { from: query.startDate, to: query.endDate },
      pager: { limit: 64, offset },
    });

    const allReservations = reservations?.data?.reservations;
    finalReservation.push(...allReservations);

    if (allReservations.length < 64) {
      hasMore = false;
    } else {
      offset += 64;
    }
  }

  const roomReservations = finalReservation?.filter((reservation: any) =>
    reservation.rooms?.some(
      (room: any) => room.id_zak_room?.toString() === roomId
    )
  );
  const detailedReservations = await Promise.all(
    roomReservations?.map(async (reservation: any) => {
      const [customer, notes] = await Promise.all([
        getCustomerById(reservation.rooms[0]?.customers[0]?.id),
        getNotesByRCode(reservation?.id_human),
      ]);

      return {
        ...reservation,
        customerName: `${customer?.data?.main_info?.name} ${customer?.data?.main_info?.surname}`,

        customerPhone: customer?.data?.contacts?.phone || 'Unknown',
        notes: notes?.data,
      };
    }) ?? []
  );

  const sortedReservations = sortReservationsByCreatedBy(
    detailedReservations,
    parseInt(roomId!)
  );

  return {
    roomName: room.name,
    room_id: room.id,
    reservations: sortedReservations,
  };
};
////////////////////////////////////////////
const createPropertyToDB = async (payload: Partial<TProperty>) => {
  const { owner, zakRoomId } = payload;
  const [isUserExist, allRooms] = await Promise.all([
    User.findById(owner),
    getAllRooms(),
  ]);
  const isAlreadyOwner = await Property.findOne({ owner, zakRoomId });
  if (isAlreadyOwner) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `${isUserExist?.name} already own this property`
    );
  }
  if (!isUserExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User does not exist');
  }

  const room = allRooms?.data?.find(
    (room: any) => room.id?.toString() === zakRoomId
  );
  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  const property = await Property.create({ ...payload, roomName: room.name });

  return property;
};

const getPropertyByIdFromDB = async (id: string) =>
  Property.findById(id).populate('owner');

const getPropertyByOwnerId = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role == 'admin') {
    const properties = await Property.find({});

    const uniqueProperties = properties.reduce((acc: TProperty[], property) => {
      if (!acc.some((p: any) => p.zakRoomId === property.zakRoomId)) {
        acc.push(property);
      }
      return acc;
    }, []);

    return uniqueProperties;
  }

  return Property.find({ owner: id });
};

const getAllProperties = async () => Property.find().populate('owner');

const removePropertyFromUser = async (owner: string, zakRoomName: string) => {
  if (!owner || !zakRoomName) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Owner or zakRoomName is missing'
    );
  }
  return Property.findOneAndDelete({ owner, roomName: zakRoomName });
};

export const PropertyService = {
  getReservationsByOwnerId,
  getReservationsForAdmin,
  getReservationsByRoomId,
  createPropertyToDB,
  getPropertyByIdFromDB,
  getAllRooms,
  getPropertyByOwnerId,
  getReservationsByRoomIdByCreatedTime,
  getAllProperties,
  removePropertyFromUser,
};
