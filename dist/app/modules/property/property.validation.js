"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyValidation = void 0;
const zod_1 = require("zod");
const createPropertyZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        owner: zod_1.z.string({ required_error: 'Owner is required' }),
        zakRoomId: zod_1.z.string({ required_error: 'ZakRoomId is required' }),
    }),
});
exports.PropertyValidation = {
    createPropertyZodSchema,
};
