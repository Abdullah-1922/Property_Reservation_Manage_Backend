"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const mongodb_1 = require("mongodb");
const user_model_1 = require("./user.model");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const property_model_1 = __importDefault(require("../property/property.model"));
const createUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate required fields
    if (!payload.email) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide email');
    }
    const isEmail = yield user_model_1.User.findOne({ email: payload.email });
    if (isEmail) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exist');
    }
    // Create user first
    const user = yield user_model_1.User.create(payload);
});
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.findById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
});
const updateProfileToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    console.log(payload);
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (payload.image &&
        isExistUser.image &&
        !isExistUser.image.includes('default_profile.jpg')) {
        (0, unlinkFile_1.default)(isExistUser.image);
    }
    const updateDoc = yield user_model_1.User.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateDoc;
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findById(id);
    return result;
});
//get all users
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({ isDeleted: false }).select('-password');
    const property = yield property_model_1.default.find();
    const usersWithProperty = users.map(user => {
        const userProperties = property
            .filter(p => new mongodb_1.ObjectId(p.owner).equals(user._id))
            .map(p => p.roomName);
        return Object.assign(Object.assign({}, user.toObject()), { property: userProperties });
    });
    return usersWithProperty;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    if (user.role === 'admin') {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Admin cannot be deleted');
    }
    yield user_model_1.User.findByIdAndUpdate(id, { isDeleted: true });
});
exports.UserService = {
    getUserProfileFromDB,
    updateProfileToDB,
    getSingleUser,
    createUserToDB,
    getAllUsers,
    deleteUser,
};
