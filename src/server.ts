import colors from 'colors';
import mongoose from 'mongoose';
// import { Server } from 'socket.io';
import app from './app';
import config from './config';
import seedAdmin from './DB';
import { Server } from 'socket.io';
import { socketHelper } from './helpers/socketHelper';

//uncaught exception
process.on('uncaughtException', error => {
  // errorLogger.error('UnhandledException Detected', error);
  console.log('UnhandledException Detected', error);
  process.exit(1);
});


let server: any;
async function main() {
  try {
    console.log("config.database_url",config.database_url);
     await mongoose.connect(config.database_url as string);
  
    seedAdmin();
    console.log(colors.green('🚀 Database connected successfully'));

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      console.log(
        colors.yellow(`♻️  Application listening on port:${config.port}`)
      );
    });

   
    // socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    socketHelper.socket(io);
    //@ts-ignore
    global.io = io;
  } catch (error) {
    console.log(error);
    console.error(colors.red('🤢 Failed to connect Database'));
  }

  //handle unhandledRejection
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        console.error('UnhandledRejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
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
