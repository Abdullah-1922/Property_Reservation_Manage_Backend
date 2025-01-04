import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { TUser } from './user.interface';
import { User } from './user.model';
import unlinkFile from '../../../shared/unlinkFile';

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
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  
  if (payload.image && isExistUser.image) {
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
  const result = await User.find();
  return result;
};


export const UserService = {
  getUserProfileFromDB,
  updateProfileToDB,
  getSingleUser,
  createUserToDB,
  getAllUsers,

};
