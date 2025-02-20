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
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHelper = void 0;
const user_model_1 = require("../app/modules/user/user.model");
const socket = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected', socket.id);
        socket.on('fcmToken', (data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(data);
            if (!data.userId || !data.fcmToken)
                return;
            try {
                const user = yield user_model_1.User.findByIdAndUpdate(data.userId, { fcmToken: data.fcmToken }, { new: true, upsert: true });
                console.log(user);
            }
            catch (error) {
                console.log(error);
            }
        }));
        // On disconnect, clean up
        socket.on('disconnect', () => {
            console.log('A user disconnected', socket.id);
        });
    });
};
exports.socketHelper = { socket };
