import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { TProperty } from './property.interface';
import Property from './property.model';
import { User } from '../user/user.model';
import config from '../../../config';

const getAllRooms = async () => {
  const rooms = await fetch(
    'https://kapi.wubook.net/kp/property/fetch_rooms',

    {
      method: 'POST',
      headers: {
        'x-api-key': config.we_book_api_key!, // Use environment variable for the API key
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return rooms.json();
};

const createPropertyToDB = async (payload: Partial<TProperty>) => {
  const { owner, zakRoomId } = payload;
  const isExistProperty = await Property.findOne({ zakRoomId });
  if (isExistProperty) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Property already exist');
  }
  const isUserExist = await User.findById(owner);
  if (!isUserExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User does not exist');
  }
  const property = await Property.create(payload);
  console.log(property);
  return property;
};
const getPropertyByIdFromDB = async (id: string) => {
  const property = await Property.findById(id);
  return property;
};

const getPropertyByOwnerIdFromDB = async (ownerId: string) => {
  const allRooms = await getAllRooms();
  const properties = await Property.find({ owner: ownerId });

  const propertiesWithRoomNames = properties.map(property => {
    const room = allRooms.data.find(
      (room: any) => room.id.toString() === property.zakRoomId
    );
    return {
      ...property.toObject(),
      roomName: room ? room.name : 'Unknown',
    };
  });

  return propertiesWithRoomNames;
};

const getAllPropertiesFromDB = async () => {
  const properties = await Property.find();
  return properties;
};
export const PropertyService = {
  createPropertyToDB,
  getPropertyByIdFromDB,
  getPropertyByOwnerIdFromDB,
  getAllPropertiesFromDB,
};
