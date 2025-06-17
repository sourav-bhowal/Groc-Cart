const { categories, products } = await import("./seed-data");
import mongoose from "mongoose";
import { CategoryModel, ProductModel } from "../models/index.models";
import { MONGODB_URI } from "../config/config";

// iffi
(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);

    // Clear existing data
    await CategoryModel.deleteMany({});
    await ProductModel.deleteMany({});

    // Seed categories
    const categoryDocs = await CategoryModel.insertMany(categories);
    console.log("Categories seeded");

    // Seed products with category references
    const productDocs = await ProductModel.insertMany(
      products.map((product) => ({
        ...product,
        category: categoryDocs.find(
          (category) => category.name === product.category
        )?._id,
      }))
    );
    console.log("Products seeded");
  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
})();
