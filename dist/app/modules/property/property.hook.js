"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.reservationStatusChangeHook = exports.newReservationAddHook = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const property_model_1 = __importDefault(require("./property.model"));
const property_service_1 = require("./property.service");
const user_model_1 = require("../user/user.model");
const admin = __importStar(require("firebase-admin"));
exports.newReservationAddHook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('req body from real data', req.body);
    // const reqData = req.body;
    const reqData = {
        property: '183308',
        event: 'new_reservation',
        url: 'http://115.127.156.13:5002/api/v1/new-reservation-added-hook',
        push_data: '{"reservation": 17024718}',
    };
    console.log(reqData);
    const pushData = JSON.parse(reqData.push_data);
    console.log(pushData);
    const reservationId = pushData.reservation;
    const reservationDetails = yield (0, property_service_1.fetchFromApi)('https://kapi.wubook.net/kp/reservations/fetch_one_reservation', new URLSearchParams({ id: reservationId }));
    console.dir(reservationDetails, { depth: Infinity });
    if (!reservationDetails) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
            message: 'Reservation not found',
        });
    }
    const rooms = (_a = reservationDetails === null || reservationDetails === void 0 ? void 0 : reservationDetails.data) === null || _a === void 0 ? void 0 : _a.rooms;
    rooms.forEach((room) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const zakRoomId = room.id_zak_room;
        console.log(zakRoomId);
        const property = yield property_model_1.default.findOne({ zakRoomId });
        console.log(property);
        if (!property) {
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                message: 'Property not found',
            });
        }
        const formattedData = {
            zakRoomId: zakRoomId,
            title: `🛎️ ${property.roomName} - New Reservation Have Been Added`,
            from: room.dfrom,
            to: room.dto,
            total: (_a = reservationDetails === null || reservationDetails === void 0 ? void 0 : reservationDetails.data) === null || _a === void 0 ? void 0 : _a.price.total,
        };
        console.log(formattedData);
        const ownerList = yield property_model_1.default.find({
            zakRoomId: zakRoomId,
        }).select('owner');
        // If no owners are found, return a 404 response
        if (ownerList.length === 0) {
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                message: 'No owners found for the specified room ID',
            });
        }
        //@ts-ignore
        // Emit the event to all owners
        const socketIo = global.io;
        ownerList.forEach((owner) => __awaiter(void 0, void 0, void 0, function* () {
            const fcm = yield user_model_1.User.findById(owner.owner).select('fcmToken');
            if (owner && owner.owner && (fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken)) {
                console.log('owner token', fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken);
                try {
                    // Emit to the user's socket
                    // socketIo.emit(`reservation-status-change:${owner.owner.toString()}`, {
                    //   formattedData,
                    // });
                    if ((fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken) === null ||
                        (fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken) === 'kafikafi1922@gmail.com') {
                        console.log('fcm token is null');
                        return;
                    }
                    const message = {
                        token: fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken, // Device FCM Token
                        notification: {
                            title: formattedData.title,
                            body: ` From: ${formattedData.from} To: ${formattedData.to}`, // Message
                        },
                        data: {
                            extraData: 'Custom Data For User',
                        },
                    };
                    yield admin.messaging().send(message);
                }
                catch (error) {
                    console.error(`Error emitting to user ${owner.owner}:`, error);
                }
            }
        }));
    }));
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Reservation status changed and notifications triggered',
        data: null,
    });
}));
exports.reservationStatusChangeHook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(req.body);
    const data = {
        property: '183308',
        event: 'change_status',
        url: 'http://115.127.156.13:5002/api/v1/new-reservation-added-hook',
        push_data: '{"reservation": 21306358,"old_status": "confirmed","new_status": "cancelled"}',
    };
    // const data = req.body;
    console.log(data);
    const pushData = JSON.parse(data.push_data);
    //  console.log(pushData);
    const reservationId = pushData.reservation;
    const reservationDetails = yield (0, property_service_1.fetchFromApi)('https://kapi.wubook.net/kp/reservations/fetch_one_reservation', new URLSearchParams({ id: reservationId }));
    console.log(reservationDetails);
    if (!reservationDetails) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
            message: 'Reservation not found',
        });
    }
    const rooms = (_a = reservationDetails === null || reservationDetails === void 0 ? void 0 : reservationDetails.data) === null || _a === void 0 ? void 0 : _a.rooms;
    rooms.forEach((room) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const zakRoomId = room.id_zak_room;
        console.log(zakRoomId);
        const property = yield property_model_1.default.findOne({ zakRoomId });
        console.log(property);
        if (!property) {
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                message: 'Property not found',
            });
        }
        const formattedData = {
            zakRoomId: zakRoomId,
            title: `🛎️ ${property.roomName} - Reservation Status Changed to ${(_a = reservationDetails === null || reservationDetails === void 0 ? void 0 : reservationDetails.data) === null || _a === void 0 ? void 0 : _a.status}`,
            from: room.dfrom,
            to: room.dto,
        };
        console.log(formattedData);
        const ownerList = yield property_model_1.default.find({
            zakRoomId: zakRoomId,
        }).select('owner');
        // If no owners are found, return a 404 response
        if (ownerList.length === 0) {
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                message: 'No owners found for the specified room ID',
            });
        }
        //@ts-ignore
        // Emit the event to all owners
        const socketIo = global.io;
        ownerList.forEach((owner) => __awaiter(void 0, void 0, void 0, function* () {
            const fcm = yield user_model_1.User.findById(owner.owner).select('fcmToken');
            if (owner && owner.owner && (fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken)) {
                console.log('owner token', fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken);
                try {
                    // Emit to the user's socket
                    // socketIo.emit(`reservation-status-change:${owner.owner.toString()}`, {
                    //   formattedData,
                    // });
                    if ((fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken) === null ||
                        (fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken) === 'kafikafi1922@gmail.com') {
                        console.log('fcm token is null');
                        return;
                    }
                    const message = {
                        token: fcm === null || fcm === void 0 ? void 0 : fcm.fcmToken, // Device FCM Token
                        notification: {
                            title: formattedData.title,
                            body: ` From: ${formattedData.from} To: ${formattedData.to}`, // Message
                        },
                        data: {
                            extraData: 'Custom Data For User',
                        },
                    };
                    yield admin.messaging().send(message);
                }
                catch (error) {
                    console.error(`Error emitting to user ${owner.owner}:`, error);
                }
            }
        }));
    }));
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Reservation status changed and notifications triggered',
        data: null,
    });
}));
