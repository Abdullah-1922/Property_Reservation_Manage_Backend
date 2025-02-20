import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import {
  newReservationAddHook,
  reservationStatusChangeHook,
} from './app/modules/property/property.hook';
import admin from 'firebase-admin';
import ServiceAccount from '../gestion-admin.json';

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

admin.initializeApp({
  credential: admin.credential.cert(ServiceAccount as admin.ServiceAccount),
});

//body parser
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));
app.get('/favicon.ico', (req, res) => res.status(204).end());
//router
app.post('/api/v1/new-reservation-added-hook', newReservationAddHook);
app.post('/api/v1/reservation-status-change-hook', reservationStatusChangeHook);
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Hey, How can I assist you today!</h1>'
  );
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
