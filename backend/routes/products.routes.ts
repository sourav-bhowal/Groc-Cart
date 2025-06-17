import type { FastifyInstance } from "fastify";
import { getAllCategories } from "../controllers/category.controller";
import { getProductsByCategoryId } from "../controllers/products.controller";

// Category Routes for Product Management
export const categoryRoutes = async (
  fastify: FastifyInstance,
  options: any = {}
) => {
  // Route to get all categories
  fastify.get("/categories", getAllCategories);
};

// Route to get products by category ID
export const productRoutes = async (
  fastify: FastifyInstance,
  options: any = {}
) => {
  // Route to get products by category ID
  fastify.get("/products/:categoryId", getProductsByCategoryId);
};
