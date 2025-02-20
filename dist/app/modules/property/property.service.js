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
exports.PropertyService = exports.getReservationsByRoomIdByCreatedTime = exports.getNotesByRCode = exports.getCustomerById = exports.getAllRooms = exports.fetchFromApi = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const property_model_1 = __importDefault(require("./property.model"));
const config_1 = __importDefault(require("../../../config"));
const user_model_1 = require("../user/user.model");
const property_utils_1 = require("./property.utils");
const fetchFromApi = (url, body) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(url);
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
exports.fetchFromApi = fetchFromApi;
const getAllRooms = () => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.fetchFromApi)('https://kapi.wubook.net/kp/property/fetch_rooms');
});
exports.getAllRooms = getAllRooms;
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
    if (filters.departure && filters.arrival) {
        const departureToDate = new Date(filters.departure.to.split('/').reverse().join('-'));
        filters.departure.to = new Date(departureToDate.getFullYear(), departureToDate.getMonth() + 4, 0).toLocaleDateString('en-GB');
        const departureFromDate = new Date(filters.departure.from.split('/').reverse().join('-'));
        filters.departure.from = new Date(departureFromDate.getFullYear(), departureFromDate.getMonth() - 1, 0).toLocaleDateString('en-GB');
        const arrivalToDate = new Date(filters.arrival.to.split('/').reverse().join('-'));
        filters.arrival.to = new Date(arrivalToDate.getFullYear(), arrivalToDate.getMonth() + 1, 0).toLocaleDateString('en-GB');
        const arrivalFromDate = new Date(filters.arrival.from.split('/').reverse().join('-'));
        filters.arrival.from = new Date(arrivalFromDate.getFullYear(), arrivalFromDate.getMonth() - 3, 0).toLocaleDateString('en-GB');
    }
    console.log(filters);
    return (0, exports.fetchFromApi)('https://kapi.wubook.net/kp/reservations/fetch_reservations', new URLSearchParams({ filters: JSON.stringify(filters) }));
});
////////////////////////
const getAllReservationByCreatedTime = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {
    created: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0).toLocaleDateString('en-GB'),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-GB'),
    },
    pager: { limit: 64, offset: 0 },
}) {
    if (filters.created) {
        const createdToDate = new Date(filters.created.to.split('/').reverse().join('-'));
        filters.created.to = new Date(createdToDate.getFullYear(), createdToDate.getMonth() + 1, 0).toLocaleDateString('en-GB');
        const createdFromDate = new Date(filters.created.from.split('/').reverse().join('-'));
        filters.created.from = new Date(createdFromDate.getFullYear(), createdFromDate.getMonth() - 6, 1).toLocaleDateString('en-GB');
    }
    console.log(filters);
    return (0, exports.fetchFromApi)('https://kapi.wubook.net/kp/reservations/fetch_reservations', new URLSearchParams({ filters: JSON.stringify(filters) }));
});
/////////////////////////////////////
const getCustomerById = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.fetchFromApi)('https://kapi.wubook.net/kp/customers/fetch_one', new URLSearchParams({ id: customerId }));
});
exports.getCustomerById = getCustomerById;
const getNotesByRCode = (rcode) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.fetchFromApi)('https://kapi.wubook.net/kapi/notes/get_notes', new URLSearchParams({ rcode }));
});
exports.getNotesByRCode = getNotesByRCode;
const getReservationsByOwnerId = (ownerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = yield (0, exports.getAllRooms)();
    const [properties, allRooms, reservations] = yield Promise.all([
        property_model_1.default.find({ owner: ownerId }).select('zakRoomId'),
        (0, exports.getAllRooms)(),
        getAllReservations({
            arrival: { from: query.startDate, to: query.endDate },
            departure: { from: query.startDate, to: query.endDate },
            pager: { limit: 128, offset: query.offset },
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
                (0, exports.getCustomerById)((_b = (_a = reservation.rooms[0]) === null || _a === void 0 ? void 0 : _a.customers[0]) === null || _b === void 0 ? void 0 : _b.id),
                (0, exports.getNotesByRCode)(reservation === null || reservation === void 0 ? void 0 : reservation.id_human),
            ]);
            return Object.assign(Object.assign({}, reservation), { customerName: `${(_d = (_c = customer === null || customer === void 0 ? void 0 : customer.data) === null || _c === void 0 ? void 0 : _c.main_info) === null || _d === void 0 ? void 0 : _d.name} ${(_f = (_e = customer === null || customer === void 0 ? void 0 : customer.data) === null || _e === void 0 ? void 0 : _e.main_info) === null || _f === void 0 ? void 0 : _f.surname}`, customerPhone: ((_h = (_g = customer === null || customer === void 0 ? void 0 : customer.data) === null || _g === void 0 ? void 0 : _g.contacts) === null || _h === void 0 ? void 0 : _h.phone) || 'Unknown', notes: notes === null || notes === void 0 ? void 0 : notes.data });
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
        (0, exports.getAllRooms)(),
        getAllReservations({
            arrival: { from: query.startDate, to: query.endDate },
            departure: { from: query.startDate, to: query.endDate },
            pager: { limit: 64, offset: query.offset || 0 },
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
                (0, exports.getCustomerById)((_b = (_a = reservation.rooms[0]) === null || _a === void 0 ? void 0 : _a.customers[0]) === null || _b === void 0 ? void 0 : _b.id),
                (0, exports.getNotesByRCode)(reservation === null || reservation === void 0 ? void 0 : reservation.id_human),
            ]);
            return Object.assign(Object.assign({}, reservation), { customerName: `${(_d = (_c = customer === null || customer === void 0 ? void 0 : customer.data) === null || _c === void 0 ? void 0 : _c.main_info) === null || _d === void 0 ? void 0 : _d.name} ${(_f = (_e = customer === null || customer === void 0 ? void 0 : customer.data) === null || _e === void 0 ? void 0 : _e.main_info) === null || _f === void 0 ? void 0 : _f.surname}`, customerPhone: ((_h = (_g = customer === null || customer === void 0 ? void 0 : customer.data) === null || _g === void 0 ? void 0 : _g.contacts) === null || _h === void 0 ? void 0 : _h.phone) || 'Unknown', notes: notes === null || notes === void 0 ? void 0 : notes.data });
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
    const allRooms = yield (0, exports.getAllRooms)();
    const room = (_a = allRooms === null || allRooms === void 0 ? void 0 : allRooms.data) === null || _a === void 0 ? void 0 : _a.find((room) => { var _a; return ((_a = room.id) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
    if (!room) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Room not found');
    }
    const finalReservation = [];
    let offset = query.offset || 0;
    let hasMore = true;
    while (hasMore) {
        const reservations = yield getAllReservations({
            arrival: { from: query.startDate, to: query.endDate },
            departure: { from: query.startDate, to: query.endDate },
            pager: { limit: 64, offset },
        });
        const allReservations = (_b = reservations === null || reservations === void 0 ? void 0 : reservations.data) === null || _b === void 0 ? void 0 : _b.reservations;
        finalReservation.push(...allReservations);
        if (allReservations.length < 64) {
            hasMore = false;
        }
        else {
            offset += 64;
        }
    }
    const roomReservations = finalReservation === null || finalReservation === void 0 ? void 0 : finalReservation.filter((reservation) => {
        var _a;
        return (_a = reservation.rooms) === null || _a === void 0 ? void 0 : _a.some((room) => { var _a; return ((_a = room.id_zak_room) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
    });
    const detailedReservations = yield Promise.all((_c = roomReservations === null || roomReservations === void 0 ? void 0 : roomReservations.map((reservation) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const [customer, notes] = yield Promise.all([
            (0, exports.getCustomerById)((_b = (_a = reservation.rooms[0]) === null || _a === void 0 ? void 0 : _a.customers[0]) === null || _b === void 0 ? void 0 : _b.id),
            (0, exports.getNotesByRCode)(reservation === null || reservation === void 0 ? void 0 : reservation.id_human),
        ]);
        return Object.assign(Object.assign({}, reservation), { customerName: `${(_d = (_c = customer === null || customer === void 0 ? void 0 : customer.data) === null || _c === void 0 ? void 0 : _c.main_info) === null || _d === void 0 ? void 0 : _d.name} ${(_f = (_e = customer === null || customer === void 0 ? void 0 : customer.data) === null || _e === void 0 ? void 0 : _e.main_info) === null || _f === void 0 ? void 0 : _f.surname}`, customerPhone: ((_h = (_g = customer === null || customer === void 0 ? void 0 : customer.data) === null || _g === void 0 ? void 0 : _g.contacts) === null || _h === void 0 ? void 0 : _h.phone) || 'Unknown', notes: notes === null || notes === void 0 ? void 0 : notes.data });
    }))) !== null && _c !== void 0 ? _c : []);
    const sortedReservations = (0, property_utils_1.sortReservationsByDates)(detailedReservations, parseInt(roomId), query);
    return {
        roomName: room.name,
        room_id: room.id,
        reservations: sortedReservations,
    };
});
//////////////////////////////////////////
const getReservationsByRoomIdByCreatedTime = (room_id, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const roomRes = yield property_model_1.default.findById(room_id).select('zakRoomId');
    const roomId = roomRes === null || roomRes === void 0 ? void 0 : roomRes.zakRoomId;
    const allRooms = yield (0, exports.getAllRooms)();
    const room = (_a = allRooms === null || allRooms === void 0 ? void 0 : allRooms.data) === null || _a === void 0 ? void 0 : _a.find((room) => { var _a; return ((_a = room.id) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
    if (!room) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Room not found');
    }
    const finalReservation = [];
    let offset = query.offset || 0;
    let hasMore = true;
    while (hasMore) {
        const reservations = yield getAllReservationByCreatedTime({
            created: { from: query.startDate, to: query.endDate },
            pager: { limit: 64, offset },
        });
        const allReservations = (_b = reservations === null || reservations === void 0 ? void 0 : reservations.data) === null || _b === void 0 ? void 0 : _b.reservations;
        finalReservation.push(...allReservations);
        if (allReservations.length < 64) {
            hasMore = false;
        }
        else {
            offset += 64;
        }
    }
    const roomReservations = finalReservation === null || finalReservation === void 0 ? void 0 : finalReservation.filter((reservation) => {
        var _a;
        return (_a = reservation.rooms) === null || _a === void 0 ? void 0 : _a.some((room) => { var _a; return ((_a = room.id_zak_room) === null || _a === void 0 ? void 0 : _a.toString()) === roomId; });
    });
    const detailedReservations = yield Promise.all((_c = roomReservations === null || roomReservations === void 0 ? void 0 : roomReservations.map((reservation) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const [customer, notes] = yield Promise.all([
            (0, exports.getCustomerById)((_b = (_a = reservation.rooms[0]) === null || _a === void 0 ? void 0 : _a.customers[0]) === null || _b === void 0 ? void 0 : _b.id),
            (0, exports.getNotesByRCode)(reservation === null || reservation === void 0 ? void 0 : reservation.id_human),
        ]);
        return Object.assign(Object.assign({}, reservation), { customerName: `${(_d = (_c = customer === null || customer === void 0 ? void 0 : customer.data) === null || _c === void 0 ? void 0 : _c.main_info) === null || _d === void 0 ? void 0 : _d.name} ${(_f = (_e = customer === null || customer === void 0 ? void 0 : customer.data) === null || _e === void 0 ? void 0 : _e.main_info) === null || _f === void 0 ? void 0 : _f.surname}`, customerPhone: ((_h = (_g = customer === null || customer === void 0 ? void 0 : customer.data) === null || _g === void 0 ? void 0 : _g.contacts) === null || _h === void 0 ? void 0 : _h.phone) || 'Unknown', notes: notes === null || notes === void 0 ? void 0 : notes.data });
    }))) !== null && _c !== void 0 ? _c : []);
    const sortedReservations = (0, property_utils_1.sortReservationsByCreatedBy)(detailedReservations, parseInt(roomId));
    return {
        roomName: room.name,
        room_id: room.id,
        reservations: sortedReservations,
    };
});
exports.getReservationsByRoomIdByCreatedTime = getReservationsByRoomIdByCreatedTime;
////////////////////////////////////////////
const createPropertyToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { owner, zakRoomId } = payload;
    const [isUserExist, allRooms] = yield Promise.all([
        user_model_1.User.findById(owner),
        (0, exports.getAllRooms)(),
    ]);
    const isAlreadyOwner = yield property_model_1.default.findOne({ owner, zakRoomId });
    if (isAlreadyOwner) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `${isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.name} already own this property`);
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
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiError_1.default(404, 'User not found');
    }
    if (user.role == 'admin') {
        const properties = yield property_model_1.default.find({});
        const uniqueProperties = properties.reduce((acc, property) => {
            if (!acc.some((p) => p.zakRoomId === property.zakRoomId)) {
                acc.push(property);
            }
            return acc;
        }, []);
        return uniqueProperties;
    }
    return property_model_1.default.find({ owner: id });
});
const getAllProperties = () => __awaiter(void 0, void 0, void 0, function* () { return property_model_1.default.find().populate('owner'); });
const removePropertyFromUser = (owner, zakRoomName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!owner || !zakRoomName) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Owner or zakRoomName is missing');
    }
    return property_model_1.default.findOneAndDelete({ owner, roomName: zakRoomName });
});
exports.PropertyService = {
    getReservationsByOwnerId,
    getReservationsForAdmin,
    getReservationsByRoomId,
    createPropertyToDB,
    getPropertyByIdFromDB,
    getAllRooms: exports.getAllRooms,
    getPropertyByOwnerId,
    getReservationsByRoomIdByCreatedTime: exports.getReservationsByRoomIdByCreatedTime,
    getAllProperties,
    removePropertyFromUser,
};
