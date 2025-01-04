import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { PropertyValidation } from './property.validation';
import { PropertyController } from './property.controller';

const router = express.Router();
router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(PropertyValidation.createPropertyZodSchema),
  PropertyController.createProperty
);
router.get('/', auth(USER_ROLES.ADMIN), PropertyController.getAllProperties);
router.get('/:id', auth(USER_ROLES.ADMIN), PropertyController.getPropertyById);
router.get(
  '/owner/:ownerId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PropertyController.getPropertyByOwnerId
);

export const PropertyRoutes = router;