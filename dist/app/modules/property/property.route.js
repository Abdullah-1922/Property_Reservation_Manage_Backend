"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const property_validation_1 = require("./property.validation");
const property_controller_1 = require("./property.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(property_validation_1.PropertyValidation.createPropertyZodSchema), property_controller_1.PropertyController.createProperty);
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), property_controller_1.PropertyController.getAllProperties);
router.get('/reservation/owner/:ownerId', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), property_controller_1.PropertyController.getReservationsByOwnerId);
// get reservations by room id (by created time)
router.get('/reservation/room/log/:roomId', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), property_controller_1.PropertyController.getReservationsByRoomIdByCreatedTime);
// get reservations by room id
router.get('/reservation/room/:roomId', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), property_controller_1.PropertyController.getReservationsByRoomId);
router.get('/reservation/admin', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), property_controller_1.PropertyController.getReservationsForAdmin);
router.get('/owner/:ownerId', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), property_controller_1.PropertyController.getPropertyByOwnerId);
router.get('/zak-rooms', property_controller_1.PropertyController.getAllRooms);
router.get('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), property_controller_1.PropertyController.getPropertyById);
router.delete('/remove-property/:ownerId', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), property_controller_1.PropertyController.removePropertyFromUser);
exports.PropertyRoutes = router;
