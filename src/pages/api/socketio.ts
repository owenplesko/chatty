import { NextApiRequest } from "next";
import NextApiResponseServerIO  from '../../types/next-socketio'
import { Server as ServerIO } from "socket.io";
import { Server as HttpServer } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    const httpServer: HttpServer = res.socket.server;
    const io = new ServerIO(httpServer);
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;
  }
  res.end();
};