import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import Property from './property.model';
import config from '../../../config';
import { TProperty } from './property.interface';
import { User } from '../user/user.model';

const fetchFromApi = async (url: string, body?: URLSearchParams) => {
  console.log(url, body);
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

const getAllRooms = async () => {
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
  return fetchFromApi(
    'https://kapi.wubook.net/kp/reservations/fetch_reservations',
    new URLSearchParams({ filters: JSON.stringify(filters) })
  );
};

const getCustomerById = async (customerId: string) =>
  fetchFromApi(
    'https://kapi.wubook.net/kp/customers/fetch_one',
    new URLSearchParams({ id: customerId })
  );

const getNotesByRCode = async (rcode: string) =>
  fetchFromApi(
    'https://kapi.wubook.net/kapi/notes/get_notes',
    new URLSearchParams({ rcode })
  );

const getReservationsByOwnerId = async (
  ownerId: string,
  query: { startDate: string; endDate: string; offset: number }
) => {
  const [properties, allRooms, reservations] = await Promise.all([
    Property.find({ owner: ownerId }).select('zakRoomId'),
    getAllRooms(),

    getAllReservations({
      arrival: { from: query.startDate, to: query.endDate },
      departure: { from: query.startDate, to: query.endDate },
      pager: { limit: 64, offset: query.offset },
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
              customerName: customer?.data?.main_info?.name,
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
      pager: { limit: 64, offset: query.offset },
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
              customerName: customer?.data?.main_info?.name,
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

  const reservations = await getAllReservations({
    arrival: { from: query.startDate, to: query.endDate },
    departure: { from: query.startDate, to: query.endDate },
    pager: { limit: 64, offset: query.offset },
  });
  const allReservations = reservations?.data?.reservations;

  const roomReservations = allReservations?.filter((reservation: any) =>
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
        customerName: customer?.data?.main_info?.name,
        notes: notes?.data,
      };
    }) ?? []
  );

  return {
    roomName: room.name,
    reservations: detailedReservations,
  };
};

const createPropertyToDB = async (payload: Partial<TProperty>) => {
  const { owner, zakRoomId } = payload;
  const [isExistProperty, isUserExist] = await Promise.all([
    Property.findOne({ zakRoomId }),
    User.findById(owner),
  ]);

  if (isExistProperty) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Property already exist');
  }
  if (!isUserExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User does not exist');
  }

  const property = await Property.create(payload);
  console.log(property);
  return property;
};

const getPropertyByIdFromDB = async (id: string) => Property.findById(id);

const getPropertyByOwnerId = async (id: string) => {
  return Property.find({ owner: id });
};

export const PropertyService = {
  getReservationsByOwnerId,
  getReservationsForAdmin,
  getReservationsByRoomId,
  createPropertyToDB,
  getPropertyByIdFromDB,
  getAllRooms,
  getPropertyByOwnerId,
};
