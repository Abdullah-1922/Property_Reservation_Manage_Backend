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
exports.PropertyService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const property_model_1 = __importDefault(require("./property.model"));
const config_1 = __importDefault(require("../../../config"));
const user_model_1 = require("../user/user.model");
const fetchFromApi = (url, body) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(url, body);
    const response = yield fetch(url, {
        method: 'POST',
        headers: {
            'x-api-key': config_1.default.we_book_api_key,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });
    return response.json();
});
const getAllRooms = () => __awaiter(void 0, void 0, void 0, function* () {
    return fetchFromApi('https://kapi.wubook.net/kp/property/fetch_rooms');
});
const getAllReservations = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {
    arrival: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-GB'),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-GB'),
    },
    departure: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-GB'),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-GB'),
    },
    pager: { limit: 64, offset: 0 },
}) {
    return fetchFromApi('https://kapi.wubook.net/kp/reservations/fetch_reservations', new URLSearchParams({ filters: JSON.stringify(filters) }));
});
const getCustomerById = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    return fetchFromApi('https://kapi.wubook.net/kp/customers/fetch_one', new URLSearchParams({ id: customerId }));
});
const getNotesByRCode = (rcode) => __awaiter(void 0, void 0, void 0, function* () {
    return fetchFromApi('https://kapi.wubook.net/kapi/notes/get_notes', new URLSearchParams({ rcode }));
});
const getReservationsByOwnerId = (ownerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [properties, allRooms, reservations] = yield Promise.all([
        property_model_1.default.find({ owner: ownerId }).select('zakRoomId'),
        getAllRooms(),
        getAllReservations({
            arrival: { from: query.startDate, to: query.endDate },
            departure: { from: query.startDate, to: query.endDate },
            pager: { limit: 64, offset: query.offset },
        }),
    ]);
    const propertyWithRoomIds = properties.map(property => property.zakRoomId);
    const allReservations = (_a = reservations === null || reservations === void 0 ? void 0 : reservations.data) === null || _a === void 0 ? void 0 : _a.reservations;
    const reservationsForOwner = allReservations === null || allReservations === void 0 ? void 0 : allReservations.filter((reservation) => {
        var _a;
        return (_a = reservation.rooms) === null || _a === void 0 ? void 0 : _a.some((room) => { var _a; return propertyWithRoomIds.includes((_a = room.id_zak_room) === null || _a === void 0 ? void 0 : _a.toString()); });
    });
    return Promise.all(properties.map((property) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const roomReservations = yield Promise.all((_b = (_a = reservationsForOwner === null || reservationsForOwner === void 0 ? void 0 : reservationsForOwner.filter((reservation) => {
            var _a;
            return (_a = reservation.rooms) === null || _a === void 0 ? void 0 : _a.some((room) => { var _a; return ((_a = room.id_zak_room) === null || _a === void 0 ? void 0 : _a.toString()) === property.zakRoomId; });
        })) === null || _a === void 0 ? void 0 : _a.map((reservation) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const [customer, notes] = yield Promise.all([
                getCustomerById((_b = (_a = reservation.rooms[0]) === null || _a === void 0 ? void 0 : _a.customers[0]) === null || _b === void 0 ? void 0 : _b.id),
                getNotesByRCode(reservation === null || reservation === void 0 ? void 0 : reservation.id_human),
            ]);
            return Object.assign(Object.assign({}, reservation), { customerName: (_d = (_c = customer === null || customer === void 0 ? void 0 : customer.data) === null || _c === void 0 ? void 0 : _c.main_info) === null || _d === void 0 ? void 0 : _d.name, customerSurName: (_f = (_e = customer === null || customer === void 0 ? void 0 : customer.data) === null || _e === void 0 ? void 0 : _e.main_info) === null || _f === void 0 ? void 0 : _f.surname, customerPhone: ((_h = (_g = customer === null || customer === void 0 ? void 0 : customer.data) === null || _g === void 0 ? void 0 : _g.main_info) === null || _h === void 0 ? void 0 : _h.phone) || 'Unknown', notes: notes === null || notes === void 0 ? void 0 : notes.data });
        }))) !== null && _b !== void 0 ? _b : []);
        const room = (_c = allRooms === null || allRooms === void 0 ? void 0 : allRooms.data) === null || _c === void 0 ? void 0 : _c.find((room) => { var _a; return ((_a = room.id) === null || _a === void 0 ? void 0 : _a.toString()) === property.zakRoomId; });
        return Object.assign(Object.assign({}, property.toObject()), { roomName: room ? room.name : 'Unknown', reservations: roomReservations });
    })));
});
//getReservationsForAdmin
const getReservationsForAdmin = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [properties, allRooms, reservations] = yield Promise.all([
        property_model_1.default.find({}).select('zakRoomId'),
        getAllRooms(),
        getAllReservations({
            arrival: { from: query.startDate, to: query.endDate },
            departure: { from: query.startDate, to: query.endDate },
            pager: { limit: 64, offset: query.offset },
        }),
    ]);
    const allReservations = (_a = reservations === null || reservations === void 0 ? void 0 : reservations.data) === null || _a === void 0 ? void 0 : _a.reservations;
    return Promise.all(properties.map((property) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const roomReservations = yield Promise.all((_b = (_a = allReservations === null || allReservations === void 0 ? void 0 : allReservations.filter((reservation) => {
            var _a;
            return (_a = reservation.rooms) === null || _a === void 0 ? void 0 : _a.some((room) => { var _a; return ((_a = room === null || room === void 0 ? void 0 : room.id_zak_room) === null || _a === void 0 ? void 0 : _a.toString()) === property.zakRoomId; });
        })) === null || _a === void 0 ? void 0 : _a.map((reservation) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const [customer, notes] = yield Promise.all([
                getCustomerById((_b = (_a = reservation.rooms[0]) === null || _a === void 0 ? void 0 : _a.customers[0]) === null || _b === void 0 ? void 0 : _b.id),
                getNotesByRCode(reservation === null || reservation === void 0 ? void 0 : reservation.id_human),
            ]);
            return Object.assign(Object.assign({}, reservation), { customerName: (_d = (_c = customer === null || customer === void 0 ? void 0 : customer.data) === null || _c === void 0 ? void 0 : _c.main_info) === null || _d === void 0 ? void 0 : _d.name, customerSurName: (_f = (_e = customer === null || customer === void 0 ? void 0 : customer.data) === null || _e === void 0 ? void 0 : _e.main_info) === null || _f === void 0 ? void 0 : _f.surname, customerPhone: ((_h = (_g = customer === null || customer === void 0 ? void 0 : customer.data) === null || _g === void 0 ? void 0 : _g.main_info) === null || _h === void 0 ? void 0 : _h.phone) || 'Unknown', notes: notes === null || notes === void 0 ? void 0 : notes.data });
        }))) !== null && _b !== void 0 ? _b : []);
        const room = (_c = allRooms === null || allRooms === void 0 ? void 0 : allRooms.data) === null || _c === void 0 ? void 0 : _c.find((room) => { var _a; return ((_a = room.id) === null || _a === void 0 ? void 0 : _a.toString()) === property.zakRoomId; });
        return Object.assign(Object.assign({}, property.toObject()), { roomName: room ? room.name : 'Unknown', reservations: roomReservations });
    })));
});
//getReservationsByRoomId
const getReservationsByRoomId = (room_id, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const roomRes = yield property_model_1.default.findById(room_id).select('zakRoomId');
    const roomId = roomRes === null || roomRes === void 0 ? void 0 : roomRes.zakRoomId;
    const allRooms = yield getAllRooms();
    const room = (_a = allRooms === null || allRooms === void 0 ? void 0 : allRooms.data) === null || _a === void 0 ? void 0 : _a.find((room) => { var _a; return ((_a = room.id) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
    if (!room) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Room not found');
    }
    const reservations = yield getAllReservations({
        arrival: { from: query.startDate, to: query.endDate },
        departure: { from: query.startDate, to: query.endDate },
        pager: { limit: 64, offset: query.offset },
    });
    const allReservations = (_b = reservations === null || reservations === void 0 ? void 0 : reservations.data) === null || _b === void 0 ? void 0 : _b.reservations;
    const roomReservations = allReservations === null || allReservations === void 0 ? void 0 : allReservations.filter((reservation) => {
        var _a;
        return (_a = reservation.rooms) === null || _a === void 0 ? void 0 : _a.some((room) => { var _a; return ((_a = room.id_zak_room) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
    });
    const detailedReservations = yield Promise.all((_c = roomReservations === null || roomReservations === void 0 ? void 0 : roomReservations.map((reservation) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const [customer, notes] = yield Promise.all([
            getCustomerById((_b = (_a = reservation.rooms[0]) === null || _a === void 0 ? void 0 : _a.customers[0]) === null || _b === void 0 ? void 0 : _b.id),
            getNotesByRCode(reservation === null || reservation === void 0 ? void 0 : reservation.id_human),
        ]);
        return Object.assign(Object.assign({}, reservation), { customerName: (_d = (_c = customer === null || customer === void 0 ? void 0 : customer.data) === null || _c === void 0 ? void 0 : _c.main_info) === null || _d === void 0 ? void 0 : _d.name, customerSurName: (_f = (_e = customer === null || customer === void 0 ? void 0 : customer.data) === null || _e === void 0 ? void 0 : _e.main_info) === null || _f === void 0 ? void 0 : _f.surname, customerPhone: ((_h = (_g = customer === null || customer === void 0 ? void 0 : customer.data) === null || _g === void 0 ? void 0 : _g.main_info) === null || _h === void 0 ? void 0 : _h.phone) || 'Unknown', notes: notes === null || notes === void 0 ? void 0 : notes.data });
    }))) !== null && _c !== void 0 ? _c : []);
    return {
        roomName: room.name,
        reservations: detailedReservations,
    };
});
const createPropertyToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { owner, zakRoomId } = payload;
    const [isExistProperty, isUserExist, allRooms] = yield Promise.all([
        property_model_1.default.findOne({ zakRoomId }),
        user_model_1.User.findById(owner),
        getAllRooms(),
    ]);
    if (isExistProperty) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Property already exist');
    }
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User does not exist');
    }
    const room = (_a = allRooms === null || allRooms === void 0 ? void 0 : allRooms.data) === null || _a === void 0 ? void 0 : _a.find((room) => { var _a; return ((_a = room.id) === null || _a === void 0 ? void 0 : _a.toString()) === zakRoomId; });
    if (!room) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Room not found');
    }
    const property = yield property_model_1.default.create(Object.assign(Object.assign({}, payload), { roomName: room.name }));
    return property;
});
const getPropertyByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () { return property_model_1.default.findById(id).populate('owner'); });
const getPropertyByOwnerId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return property_model_1.default.find({ owner: id });
});
const getAllProperties = () => __awaiter(void 0, void 0, void 0, function* () { return property_model_1.default.find().populate('owner'); });
exports.PropertyService = {
    getReservationsByOwnerId,
    getReservationsForAdmin,
    getReservationsByRoomId,
    createPropertyToDB,
    getPropertyByIdFromDB,
    getAllRooms,
    getPropertyByOwnerId,
    getAllProperties,
};
