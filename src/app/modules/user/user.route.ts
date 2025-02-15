import express, { NextFunction, Request, Response } from 'express';
import { UserController } from './user.controller';

import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();
router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser
);
router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  UserController.getUserProfile
);
router.get(
  '/get-all-users',
  auth(USER_ROLES.ADMIN),
  UserController.getAllUsers
);
router.get(
  '/get-all-users/:id',
  auth(USER_ROLES.ADMIN),
  UserController.getSingleUser
);
router.put(
  '/update-profile',
  fileUploadHandler(),
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
    
      req.body = UserValidation.updateZodSchema.parse(
        JSON.parse(req.body.data)
      );
    }
    return UserController.updateProfile(req, res, next);
  }
);
router.delete(
  '/delete-user/:id',
  auth(USER_ROLES.ADMIN),
  UserController.deleteUser
);

export const UserRoutes = router;
