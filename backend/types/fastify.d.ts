import type { Server as SocketIOServer } from "socket.io";
import { IUser } from "../models/user.models";

declare module "fastify" {
  interface FastifyRequest {
    user: IUser;
  }

  interface FastifyInstance {
    io: SocketIOServer;
  }
}
