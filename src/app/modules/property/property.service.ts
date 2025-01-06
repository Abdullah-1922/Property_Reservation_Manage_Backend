import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { TProperty } from './property.interface';
import Property from './property.model';
import { User } from '../user/user.model';
import config from '../../../config';

const fetchFromApi = async (url: string, body?: URLSearchParams) => {
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

const getAllRooms = async () =>
  fetchFromApi('https://kapi.wubook.net/kp/property/fetch_rooms');
const getAllReservations = async () =>
  fetchFromApi('https://kapi.wubook.net/kp/reservations/fetch_reservations');
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

const getPropertyByOwnerIdFromDB = async (ownerId: string) => {
  const [allRooms, properties] = await Promise.all([
    getAllRooms(),
    Property.find({ owner: ownerId }),
  ]);

  return properties.map(property => {
    const room = allRooms.data.find(
      (room: any) => room.id.toString() === property.zakRoomId
    );
    return {
      ...property.toObject(),
      roomName: room ? room.name : 'Unknown',
    };
  });
};

const getReservationsByOwnerId = async (ownerId: string) => {
  const [properties, allRooms, reservations] = await Promise.all([
    Property.find({ owner: ownerId }).select('zakRoomId'),
    getAllRooms(),
    getAllReservations(),
  ]);

  const propertyWithRoomIds = properties.map(property => property.zakRoomId);
  const allReservations = reservations.data.reservations;

  const reservationsForOwner = allReservations.filter((reservation: any) =>
    reservation.rooms.some((room: any) =>
      propertyWithRoomIds.includes(room.id_zak_room.toString())
    )
  );

  return Promise.all(
    properties.map(async property => {
      const roomReservations = await Promise.all(
        reservationsForOwner
          .filter((reservation: any) =>
            reservation.rooms.some(
              (room: any) => room.id_zak_room.toString() === property.zakRoomId
            )
          )
          .map(async (reservation: any) => {
            const [customer, notes] = await Promise.all([
              getCustomerById(reservation.rooms[0].customers[0].id),
              getNotesByRCode(reservation?.id_human),
            ]);

            return {
              ...reservation,
              customerName: customer.data.main_info.name,
              notes: notes.data,
            };
          })
      );

      const room = allRooms.data.find(
        (room: any) => room.id.toString() === property.zakRoomId
      );
      return {
        ...property.toObject(),
        roomName: room ? room.name : 'Unknown',
        reservations: roomReservations,
      };
    })
  );
};

const getReservationsForAdmin = async () => {
  const [properties, allRooms, reservations] = await Promise.all([
    Property.find({}).select('zakRoomId'),
    getAllRooms(),
    getAllReservations(),
  ]);

  const allReservations = reservations.data.reservations;

  return Promise.all(
    properties.map(async property => {
      const roomReservations = await Promise.all(
        allReservations
          .filter((reservation: any) =>
            reservation.rooms.some(
              (room: any) => room.id_zak_room.toString() === property.zakRoomId
            )
          )
          .map(async (reservation: any) => {
            const [customer, notes] = await Promise.all([
              getCustomerById(reservation.rooms[0].customers[0].id),
              getNotesByRCode(reservation?.id_human),
            ]);

            return {
              ...reservation,
              customerName: customer.data.main_info.name,
              notes: notes.data,
            };
          })
      );

      const room = allRooms.data.find(
        (room: any) => room.id.toString() === property.zakRoomId
      );
      return {
        ...property.toObject(),
        roomName: room ? room.name : 'Unknown',
        reservations: roomReservations,
      };
    })
  );
};

const getReservationsByRoomId = async (room_id: string) => {
   const roomRes = await Property.findById(room_id).select('zakRoomId');
  const roomId = roomRes?.zakRoomId;
  const allRooms = await getAllRooms();
  const room = allRooms.data.find((room: any) => room.id.toString() === roomId);

  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
  }

  const reservations = await getAllReservations();
  const allReservations = reservations.data.reservations;

  const roomReservations = allReservations.filter((reservation: any) =>
    reservation.rooms.some(
      (room: any) => room.id_zak_room.toString() === roomId
    )
  );

  const detailedReservations = await Promise.all(
    roomReservations.map(async (reservation: any) => {
      const [customer, notes] = await Promise.all([
        getCustomerById(reservation.rooms[0].customers[0].id),
        getNotesByRCode(reservation?.id_human),
      ]);

      return {
        ...reservation,
        customerName: customer.data.main_info.name,
        notes: notes.data,
      };
    })
  );

  return {
    roomName: room.name,
    reservations: detailedReservations,
  };
};

const getAllPropertiesFromDB = async () => Property.find();

export const PropertyService = {
  createPropertyToDB,
  getPropertyByIdFromDB,
  getPropertyByOwnerIdFromDB,
  getAllPropertiesFromDB,
  getReservationsByOwnerId,
  getReservationsForAdmin,
  getReservationsByRoomId,
};
