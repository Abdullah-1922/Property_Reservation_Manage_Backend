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
const colors_1 = __importDefault(require("colors"));
const mongoose_1 = __importDefault(require("mongoose"));
// import { Server } from 'socket.io';
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const DB_1 = __importDefault(require("./DB"));
const socket_io_1 = require("socket.io");
const socketHelper_1 = require("./helpers/socketHelper");
//uncaught exception
process.on('uncaughtException', error => {
    // errorLogger.error('UnhandledException Detected', error);
    console.log('UnhandledException Detected', error);
    process.exit(1);
});
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, DB_1.default)();
            mongoose_1.default.connect(config_1.default.database_url, {
                serverSelectionTimeoutMS: 30000, // Increase to 30 seconds
                connectTimeoutMS: 30000, // Increase to 30 seconds
            });
            console.log(colors_1.default.green('🚀 Database connected successfully'));
            const port = typeof config_1.default.port === 'number' ? config_1.default.port : Number(config_1.default.port);
            server = app_1.default.listen(port, config_1.default.ip_address, () => {
                console.log(colors_1.default.yellow(`♻️  Application listening on port:${config_1.default.port}`));
            });
            // socket
            const io = new socket_io_1.Server(server, {
                pingTimeout: 60000,
                cors: {
                    origin: '*',
                },
            });
            socketHelper_1.socketHelper.socket(io);
            //@ts-ignore
            global.io = io;
        }
        catch (error) {
            console.error(colors_1.default.red('🤢 Failed to connect Database'));
        }
        //handle unhandledRejection
        process.on('unhandledRejection', error => {
            if (server) {
                server.close(() => {
                    console.error('UnhandledRejection Detected', error);
                    process.exit(1);
                });
            }
            else {
                process.exit(1);
            }
        });
    });
}
main();
//SIGTERM
process.on('SIGTERM', () => {
    console.log('SIGTERM IS RECEIVE');
    if (server) {
        server.close();
    }
});
