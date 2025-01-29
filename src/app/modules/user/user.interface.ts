import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { TProperty } from '../property/property.interface';

export type TUser = {
  role: USER_ROLES;
  name: string;
  email: string;
  password: string;
  image: string;
  phone?: string;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  property?:TProperty[];
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<TUser>;
