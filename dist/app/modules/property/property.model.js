"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const propertySchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    zakRoomId: { type: String, required: true },
    roomName: { type: String, required: true },
});
const Property = (0, mongoose_1.model)('Property', propertySchema);
exports.default = Property;
