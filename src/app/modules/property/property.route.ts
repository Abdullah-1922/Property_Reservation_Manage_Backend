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
router.get(
  '/reservation/owner/:ownerId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PropertyController.getReservationsByOwnerId
);
// get reservations by room id (by created time)
router.get(
  '/reservation/room/log/:roomId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PropertyController.getReservationsByRoomIdByCreatedTime
);
// get reservations by room id
router.get(
  '/reservation/room/:roomId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PropertyController.getReservationsByRoomId
);
router.get(
  '/reservation/admin',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PropertyController.getReservationsForAdmin
);
router.get(
  '/owner/:ownerId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PropertyController.getPropertyByOwnerId
);
router.get('/zak-rooms', PropertyController.getAllRooms);
router.get('/:id', auth(USER_ROLES.ADMIN), PropertyController.getPropertyById);



router.delete(
  '/remove-property/:ownerId',
  auth(USER_ROLES.ADMIN),
  PropertyController.removePropertyFromUser
);
export const PropertyRoutes = router;
