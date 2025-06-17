import { verifyUser } from "../middlewares/user.middleware";
import type { FastifyInstance } from "fastify";
import {
  createOrder,
  updateOrderStatus,
  confirmOrder,
  getOrderById,
  getOrders,
} from "../controllers/orders.controller";

// Order Routes for Order Management
export const orderRoutes = async (
  fastify: FastifyInstance,
  options: any = {}
) => {
  // Hook to verify user authentication for all order routes
  fastify.addHook("preHandler", verifyUser);

  fastify.post("/order", createOrder);
  fastify.put("/order/:orderId/status", updateOrderStatus);
  fastify.post("/order/:orderId/confirm", confirmOrder);
  fastify.get("/order/:orderId", getOrderById);
  fastify.get("/orders", getOrders);
};
