import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import Property from './property.model';
import { fetchFromApi, getCustomerById } from './property.service';
import { User } from '../user/user.model';
import * as admin from 'firebase-admin';

export const newReservationAddHook = catchAsync(
  async (req: Request, res: Response) => {
    console.log(req.body);
    const reqData = {
      property: '183308',
      event: 'new_reservation',
      url: 'http://115.127.156.13:5002/api/v1/new-reservation-added-hook',
      push_data: '{"reservation": 17024718}',
    };
    console.log(reqData);
    const pushData = JSON.parse(reqData.push_data);
    const reservationId = pushData.reservation;
    const zakRoomId = reqData.property;
    const property = await Property.findOne({ zakRoomId });
    if (!property) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Property not found',
      });
    }
    const selectedReservation = await fetchFromApi(
      'https://kapi.wubook.net/kp/reservations/fetch_one_reservation',
      new URLSearchParams({ id: reservationId })
    );
    // console.dir(selectedReservation,{depth:Infinity});
    if (!selectedReservation) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Reservation not found',
      });
    }
    const data = {
      zakRoomId: zakRoomId,
      title: `🛎️ ${property.roomName} - New Reservation Have Been Added`,
      from: selectedReservation?.data?.rooms.find(
        (room: any) => room.id_zak_room.toString() === zakRoomId
      )?.dfrom,
      to: selectedReservation?.data?.rooms.find(
        (room: any) => room.id_zak_room.toString() === zakRoomId
      )?.dto,
      total: selectedReservation?.data?.price.total,
    };
    // Fetch owners for the specified zakRoomId
    const ownerList = await Property.find({
      zakRoomId: data.zakRoomId,
    }).select('owner');

    // If no owners are found, return a 404 response
    if (ownerList.length === 0) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'No owners found for the specified room ID',
      });
    }
    //@ts-ignore
    // Emit the event to all owners
    const socketIo = global.io;
    ownerList.forEach(async owner => {
      
      const fcm = await User.findById(owner.owner).select('fcmToken');
      if (owner && owner.owner && (fcm?.fcmToken !== null)) {
        try {
          // Emit to the user's socket
          // socketIo.emit(`new-reservation-added:${owner.owner.toString()}`, {
          //   data,
          // }); 
          if(fcm?.fcmToken === null || fcm?.fcmToken === 'kafikafi1922@gmail.com'){
            console.log('fcm token is null');
            return;
          }


          const message = {
            token: fcm?.fcmToken!, // Device FCM Token
            notification: {
              title: data.title,
              body: `${property.roomName} is booked From: ${data.from} To: ${data.to} Total: ${data.total}`,
            },
            data: {
              extraData: 'Custom Data For User',
            },
          };

          const response = await admin.messaging().send(message);
        } catch (error) {
          console.error(`Error emitting to user ${owner.owner}:`, error);
        }
      } else {
        console.error(`Invalid owner socket ID for owner ${owner.owner}.`);
      }
    });
  
    // Send success response
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservation added and notifications triggered',
    });
  }
);
export const reservationStatusChangeHook = catchAsync(
  async (req: Request, res: Response) => {
    console.log(req.body);
    const data = {
      property: '183308',
      event: 'change_status',
      url: 'http://115.127.156.13:5002/api/v1/new-reservation-added-hook',
      push_data:
        '{"reservation": 21306358,"old_status": "confirmed","new_status": "cancelled"}',
    };
    // const data = req.body;

    const pushData = JSON.parse(data.push_data);

    const reservationId = pushData.reservation;

    const zakRoomId = data.property;
    const property = await Property.findOne({ zakRoomId });
    if (!property) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Property not found',
      });
    }
    const reservationDetails = await fetchFromApi(
      'https://kapi.wubook.net/kp/reservations/fetch_one_reservation',
      new URLSearchParams({ id: reservationId })
    );

    if (!reservationDetails) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Reservation not found',
      });
    }
    const formattedData = {
      zakRoomId: zakRoomId,
      title: `${property.roomName} - Reservation Status Changed`,
      details: ` Reservation ${reservationDetails?.data?.id_human} has just changed its status to ${reservationDetails?.data?.status}`,
    };
    console.log(reservationDetails);

    const ownerList = await Property.find({
      zakRoomId: data.property,
    }).select('owner');

    // If no owners are found, return a 404 response
    if (ownerList.length === 0) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'No owners found for the specified room ID',
      });
    }
    //@ts-ignore
    // Emit the event to all owners
    const socketIo = global.io;
    ownerList.forEach(async owner => {
      const fcm = await User.findById(owner.owner).select('fcmToken');
      if (owner && owner.owner && fcm?.fcmToken) {
        try {
          // Emit to the user's socket
          // socketIo.emit(`reservation-status-change:${owner.owner.toString()}`, {
          //   formattedData,
          // });

          const message = {
            token: fcm?.fcmToken, // Device FCM Token
            notification: {
              title: formattedData.title,
              body: formattedData.details,
            },
            data: {
              extraData: 'Custom Data For User',
            },
          };

          const response = await admin.messaging().send(message);
        } catch (error) {
          console.error(`Error emitting to user ${owner.owner}:`, error);
        }
      } else {
        console.error(`Invalid owner socket ID for owner ${owner.owner}.`);
      }
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservation status changed and notifications triggered',
      data: null,
    });
  }
);
