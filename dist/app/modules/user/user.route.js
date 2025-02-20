"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(user_validation_1.UserValidation.createUserZodSchema), user_controller_1.UserController.createUser);
router.get('/profile', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER), user_controller_1.UserController.getUserProfile);
router.get('/get-all-users', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getAllUsers);
router.get('/get-all-users/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getSingleUser);
router.put('/update-profile', (0, fileUploadHandler_1.default)(), (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER), (req, res, next) => {
    if (req.body) {
        req.body = user_validation_1.UserValidation.updateZodSchema.parse(JSON.parse(req.body.data));
    }
    return user_controller_1.UserController.updateProfile(req, res, next);
});
router.delete('/delete-user/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), user_controller_1.UserController.deleteUser);
exports.UserRoutes = router;
