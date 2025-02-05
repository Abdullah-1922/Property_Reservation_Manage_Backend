import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import Property from './property.model';

export const newReservationAddHook = catchAsync(
  async (req: Request, res: Response) => {
    console.log(req.body);

    const data = {
      zakRoomId: '183308',
      status: 'confirmed',
      startDate: '2021-09-01',
      endDate: '2021-09-03',
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
    ownerList.forEach(owner => {
      if (owner && owner.owner) {

      try {
        // Emit to the user's socket
        socketIo.emit(`new-reservation-added:${owner.owner.toString()}`, {
        zakRoomId: data.zakRoomId,
        ownerId: owner.owner,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        });
    
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
      data: ownerList,
    });
  }
);
export const reservationStatusChangeHook = catchAsync(
  async (req: Request, res: Response) => {
    console.log(req.body);

    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservation status changed and notifications triggered',
      data: null
    });


  }
);
