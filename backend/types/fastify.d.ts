import { IUser } from "../models/user.models";

declare module "fastify" {
  interface FastifyRequest {
    user: IUser;
  }
}
