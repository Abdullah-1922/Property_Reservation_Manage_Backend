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
exports.PropertyController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const property_service_1 = require("./property.service");
const createProperty = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield property_service_1.PropertyService.createPropertyToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Property created successfully',
        data: result,
    });
}));
const getPropertyById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield property_service_1.PropertyService.getPropertyByIdFromDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Property retrieved successfully',
        data: result,
    });
}));
const getPropertyByOwnerId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield property_service_1.PropertyService.getPropertyByOwnerId(req.params.ownerId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Property retrieved successfully',
        data: result,
    });
}));
const getAllProperties = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield property_service_1.PropertyService.getAllProperties();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Properties retrieved successfully',
        data: result,
    });
}));
const getReservationsByOwnerId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        offset: Number(req.query.offset),
    };
    const result = yield property_service_1.PropertyService.getReservationsByOwnerId(req.params.ownerId, query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Reservations retrieved successfully',
        data: result,
    });
}));
const getReservationsForAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        offset: Number(req.query.offset),
    };
    const result = yield property_service_1.PropertyService.getReservationsForAdmin(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Reservations retrieved successfully',
        data: result,
    });
}));
const getReservationsByRoomId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        offset: Number(req.query.offset),
    };
    const result = yield property_service_1.PropertyService.getReservationsByRoomId(req.params.roomId, query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Reservations retrieved successfully',
        data: result,
    });
}));
const getReservationsByRoomIdByCreatedTime = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        offset: Number(req.query.offset),
    };
    const result = yield property_service_1.PropertyService.getReservationsByRoomIdByCreatedTime(req.params.roomId, query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Reservations retrieved successfully (by created time)',
        data: result,
    });
}));
const getAllRooms = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield property_service_1.PropertyService.getAllRooms();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Rooms from zak retrieved successfully',
        data: result,
    });
}));
const removePropertyFromUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield property_service_1.PropertyService.removePropertyFromUser(req.params.ownerId, req.body.zakRoomName);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Property removed successfully',
        data: result,
    });
}));
exports.PropertyController = {
    createProperty,
    getPropertyById,
    getPropertyByOwnerId,
    getAllProperties,
    getReservationsByOwnerId,
    getReservationsForAdmin,
    getReservationsByRoomId,
    getAllRooms,
    getReservationsByRoomIdByCreatedTime,
    removePropertyFromUser
};
