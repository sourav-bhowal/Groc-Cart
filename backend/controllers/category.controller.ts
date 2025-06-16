import { CategoryModel } from "../models/index.models";
import type { FastifyReply, FastifyRequest } from "fastify";

export const getAllCategories = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Fetch all categories from the database
    const categories = await CategoryModel.find({});

    // If no categories found, return an empty array
    if (!categories || categories.length === 0) {
      return reply
        .status(200)
        .send({ message: "No categories found", categories: [] });
    }

    // Respond with the list of categories
    return reply.status(200).send({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
