"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
exports.sendNotification = void 0;
const admin = __importStar(require("firebase-admin"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const firebaseConfig = {
    type: 'service_account',
    project_id: 'notification-69041',
    private_key_id: 'ad7ca3ccca206b3e899221307d7fe9c2ecbf46a7',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDS5myXfwJXwu5S\nOqzBLmry/VSQkGHOt5axGIqJm0cjjKPF8Lv8S1julPUxh9rUQjxfD7bTJSJymMwt\nmCf1fMvEyWD+krG9wXGFLWJgqZGSnAg7c645fwlsh6LhsBDTU5jTFqUMfZUVoStm\nMAakF+ATuEx+6gCzLsYVCcrBmEhS0G0SHetoAoqRY00u3P6M4q4kS58eVGwuyYvo\nayx3O6qzg6mFhUJmGhaKIbk20tMvyYum+ho8mrvTHPyuMYgM3zHo866gOMP3Qd6s\nbZPyKNfAXXw8pURiZfwp3y7cPGdNNY3NgigpcYEMBJHTE77QM7bMOrhGLsVGGzza\nQwD+SI2dAgMBAAECggEAHjE/OBQGe5ZsRGjifPh+dqF2Rwjoe63UPK+4+5i3fzsd\n4hND8ks+JM+953SdyxfdaTWIdKNjEllWF6vqAo62ZEp5IJDTMcl9DTYRWKnF7aF5\nWzuFJHWPnZIwaxNn4T0dSpD6GXbsDi/n1OYIuVqyqVgP2XZ6GazXTkE73enFZtdt\nyFZuAJWk6AHn7tByuY4lt8nUz6E14ixd83HDkgSFUW9grRCtYeCtPrmlBo5WI1R5\nij4zBnh0DG4/y109UqBumhquXF83GoLqrzC+9CthhSfPQbs2XeGNS2oiMbKBKnK3\nmTSaCKA0rMt6M2WwEw61n112oI9mL5WlBqH2l9ovgQKBgQDwdvUxmMWZG1tEhPbk\nDy0lFv+/cEta5YlPv6iecs3gxdzbdLV18eCj78jnydr/pcJ1oV+X8UOJEvp6HWLO\nbcP5KVrfcqEGbjsN63txWrTTqIgQ3mxS/VwdhWUqgxfQ7JkUSIEUVv07AynB80dZ\n7cpwqnrhvuiodsoMFxAC6dFIgQKBgQDghn+EzNN8GEpFbDBfrGsuerCPxK6N2tAF\nDCpo+C6WFIO4MOdOfRqvyWIp0Y9g8urJoUgZZ2lGP817aCvrr/Y8ln9DnihCUHTO\nFyZQmO5duaYG2o6I++HYA1R9UslqmxZfJnDMaNh/t1y7e08IBKPZ5RBdX39kUaT7\nP3i6bi/XHQKBgCATXiWdgU4pDgWXzu8g7x6xcK/ypLqdP7G5mR55pejDu/AyIzp2\nZ0a254+zp1jOnZ/fRMcZ0a5pL6w2W0W58pg74flIax5Wed4jeTXnqZNKOcw2PzDa\nxvzRHGuNTRH7XXgNK9qwt9q1U06hyvS9+XEJ7JZMRvCh19XBBcu9sMMBAoGATpgm\nOTlt6mmiTgziHgt/9WQzPBBQPg3TdYDds6L0w8polWhg/8OhPNmUyCi4NOqzr2MK\nlwHxAwtAhatgfH87Bdh0shnB4/y/9oh5/AqcnihnaszEykTJuNDpmXkKUov5V9Nf\n9t3Ys1RfXK18a8UcCiE6CkVslZRS2TRNsYzyqC0CgYBmKnQ+UPfArXmywXqZKuTB\n2RW+g49h97P/pxJzg+g0heVBmvRtIZguP4kXJIc39vC1qha8pwAbiyjDe8+TWquv\nfUL+yHqiFRFEFRLrK9Idjh+8niF6e67JlBvh08bcjdtcQ2NDyR+yQmjDRQ+X8XNP\nUcci6NmEpeJAkFvKanlL0w==\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-d26x5@notification-69041.iam.gserviceaccount.com',
    client_id: '110647605390238161577',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-d26x5%40notification-69041.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
};
// console.log(firebaseConfig, 'firebaseConfig');
admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
});
const sendNotification = (fcmToken, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield admin.messaging().sendEachForMulticast({
            tokens: fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            apns: {
                headers: {
                    'apns-push-type': 'alert',
                },
                payload: {
                    aps: {
                        badge: 1,
                        sound: 'default',
                    },
                },
            },
        });
        return response;
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error sending message:', error.error);
        if ((error === null || error === void 0 ? void 0 : error.code) === 'messaging/third-party-auth-error') {
            // console.error('Skipping iOS token due to auth error:', error);
            return null;
        }
        else {
            // eslint-disable-next-line no-console
            console.error('Error sending message:', error);
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_IMPLEMENTED, 'Failed to send notification');
        }
    }
});
exports.sendNotification = sendNotification;
