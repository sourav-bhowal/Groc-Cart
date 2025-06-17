import { userRoutes } from "./user.routes";
import { orderRoutes } from "./orders.routes";
import { productRoutes, categoryRoutes } from "./products.routes";

import type { FastifyInstance } from "fastify";

const prefix = "/api/v1";

// Main application routes
export const appRoutes = async (
  fastify: FastifyInstance,
  options: any = {}
) => {
  // User routes for customer and delivery partner authentication and management
  fastify.register(userRoutes, { prefix });

  // Order routes for order management
  fastify.register(orderRoutes, { prefix });

  // Product and category routes for product management
  fastify.register(productRoutes, { prefix });
  fastify.register(categoryRoutes, { prefix });
};
