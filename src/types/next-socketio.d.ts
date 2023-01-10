import { Server as HttpServer, Socket } from "http";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

type NextApiResponseServerIO = NextApiResponse & {
 socket: Socket & {
    server: HttpServer & {
      io: SocketIOServer;
    }
  }
}

export default NextApiResponseServerIO;