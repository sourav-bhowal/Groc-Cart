import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import type { IUser } from "../models/user.models";

export const verifyUser = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .status(401)
        .send({ message: "Authorization header is missing" });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1];

    // Verify the token and extract user information
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as IUser;

    // Attach user information to the request object
    req.user = decoded;

    return true;
  } catch (error) {
    console.error("Error in userMiddleware:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
