import type { FastifyInstance } from "fastify";
import {
  loginCustomer,
  loginDeliveryPartner,
  updateUser,
  refreshToken,
  fetchUser,
} from "../controllers/user.controller";
import { verifyUser } from "../middlewares/user.middleware";

// User Routes for Customer and Delivery Partner Authentication and Management
export const userRoutes = async (
  fastify: FastifyInstance,
  options: any = {}
) => {
  fastify.post("/customer/login", loginCustomer);
  fastify.post("/delivery-partner/login", loginDeliveryPartner);
  fastify.post("/refresh-token", refreshToken);
  fastify.put("/user", { preHandler: [verifyUser] }, updateUser);
  fastify.get("/user", { preHandler: [verifyUser] }, fetchUser);
};
