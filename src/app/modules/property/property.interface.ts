import { Types } from "mongoose";

export type TProperty = {
    _id:string;
    owner:Types.ObjectId;
    zakRoomId:string;
    roomName:string;
}

export type TReservation = {
    id: number;
    id_human: string;
    booker: number;
    status: string;
    expiration_date: string;
    origin: {
        channel: string;
    };
    last_status_date: string;
    board: string;
    created: string;
    cpolicy: string;
    agency: string | null;
    corporate: string | null;
    price: {
        rooms: {
            amount: number;
            vat: number;
            total: number;
            discount: number;
            currency: string;
        };
        extras: {
            amount: number;
            vat: number;
            total: number;
            discount: number;
        };
        meals: {
            amount: number;
            vat: number;
            total: number;
            discount: number;
        };
        total: number;
    };
    payment: {
        amount: number;
        currency: string;
    };
    taxes: Record<string, unknown>;
    rooms: Array<{
        id_zak_room: number;
        id_zak_reservation_room: number;
        door_code: string | null;
        id_zak_room_type: number;
        dfrom: string;
        dto: string;
        occupancy: {
            adults: number;
            teens: number;
            children: number;
            babies: number;
        };
        product_id: string;
        rate_id: string;
        customers: Array<{
            checkin: string | null;
            checkout: string | null;
            id: number;
        }>;
    }>;
};