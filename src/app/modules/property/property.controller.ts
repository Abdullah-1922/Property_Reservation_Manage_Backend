import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { PropertyService } from './property.service';

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.createPropertyToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Property created successfully',
    data: result,
  });
});
const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getPropertyByIdFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Property retrieved successfully',
    data: result,
  });
});
const getPropertyByOwnerId = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getPropertyByOwnerId(req.params.ownerId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Property retrieved successfully',
    data: result,
  });
});
const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getAllProperties();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Properties retrieved successfully',
    data: result,
  });
});
const getReservationsByOwnerId = catchAsync(
  async (req: Request, res: Response) => {
    const query = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      offset: Number(req.query.offset),
    };

    const result = await PropertyService.getReservationsByOwnerId(
      req.params.ownerId,
      query
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservations retrieved successfully',
      data: result,
    });
  }
);
const getReservationsForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const query = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      offset: Number(req.query.offset),
    };

    const result = await PropertyService.getReservationsForAdmin(query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservations retrieved successfully',
      data: result,
    });
  }
);
const getReservationsByRoomId = catchAsync(
  async (req: Request, res: Response) => {
    const query = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      offset: Number(req.query.offset),
    };

    const result = await PropertyService.getReservationsByRoomId(
      req.params.roomId,
      query
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservations retrieved successfully',
      data: result,
    });
  }
);
const getReservationsByRoomIdByCreatedTime = catchAsync(
  async (req: Request, res: Response) => {
    const query = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      offset: Number(req.query.offset),
    };

    const result = await PropertyService.getReservationsByRoomIdByCreatedTime(
      req.params.roomId,
      query
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservations retrieved successfully (by created time)',
      data: result,
    });
  }
);
const getAllRooms = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getAllRooms();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rooms from zak retrieved successfully',
    data: result,
  });
});
const removePropertyFromUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PropertyService.removePropertyFromUser(req.params.ownerId, req.body.zakRoomName);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Property removed successfully',
      data: result,
    });
  }
);

export const PropertyController = {
  createProperty,
  getPropertyById,
  getPropertyByOwnerId,
  getAllProperties,
  getReservationsByOwnerId,
  getReservationsForAdmin,
  getReservationsByRoomId,
  getAllRooms,
  getReservationsByRoomIdByCreatedTime,
  removePropertyFromUser
};
