import { ProductModel } from "../models/index.models";
import type { FastifyReply, FastifyRequest } from "fastify";

export const getProductsByCategory = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Extract category ID from the request parameters
    const { categoryId } = req.params as { categoryId: string };

    // Validate category ID
    if (!categoryId) {
      return reply.status(400).send({ message: "Category ID is required" });
    }

    // Fetch products by category ID from the database
    const products = await ProductModel.find({ categoryId });

    // If no products found for the given category, return an empty array
    if (!products || products.length === 0) {
      return reply.status(200).send({
        message: "No products found for this category",
        products: [],
      });
    }

    // Respond with the list of products for the specified category
    return reply.status(200).send({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
