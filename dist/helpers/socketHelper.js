"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHelper = void 0;
const colors_1 = __importDefault(require("colors"));
const socket = (io) => {
    io.on('connection', socket => {
        console.log(colors_1.default.blue('A user connected'));
        //disconnect
        socket.on('disconnect', () => {
            console.log(colors_1.default.red('A user disconnect'));
        });
    });
};
exports.socketHelper = { socket };
