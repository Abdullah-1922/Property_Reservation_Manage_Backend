import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { ObjectId } from 'mongodb';
import { TUser } from './user.interface';
import { User } from './user.model';
import unlinkFile from '../../../shared/unlinkFile';
import Property from '../property/property.model';

const createUserToDB = async (payload: Partial<TUser>) => {
  // Validate required fields
  if (!payload.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide email');
  }
  const isEmail = await User.findOne({ email: payload.email });
  if (isEmail) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist');
  }
  // Create user first
  const user = await User.create(payload);
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<TUser>> => {
  const { id } = user;
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<TUser>
): Promise<Partial<TUser | null>> => {
  const { id } = user;
  console.log(payload);
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (
    payload.image &&
    isExistUser.image &&
    !isExistUser.image.includes('default_profile.jpg')
  ) {
    unlinkFile(isExistUser.image);
  }
  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getSingleUser = async (id: string): Promise<TUser | null> => {
  const result = await User.findById(id);
  return result;
};

//get all users
const getAllUsers = async (): Promise<TUser[]> => {
  const users = await User.find({ isDeleted: false }).select('-password');
  const property = await Property.find();

  const usersWithProperty = users.map(user => {
    const userProperties = property
      .filter(p => new ObjectId(p.owner).equals(user._id))
      .map(p => p.roomName);
    return { ...user.toObject(), property: userProperties };
  });

  return usersWithProperty;
};

const deleteUser = async (id: string): Promise<void> => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (user.role === 'admin') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin cannot be deleted');
  }
  await User.findByIdAndUpdate(id, { isDeleted: true });
};

export const UserService = {
  getUserProfileFromDB,
  updateProfileToDB,
  getSingleUser,
  createUserToDB,
  getAllUsers,
  deleteUser,
};
