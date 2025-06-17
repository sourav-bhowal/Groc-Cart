import mongoose, { Schema, Document } from "mongoose";

// Product Interface
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number; // Optional discount field
  category: mongoose.Types.ObjectId; // Reference to Category
  image?: string;
  quantity: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Schema
const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number }, // Optional field
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: { type: String },
    quantity: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export Product Model
export const ProductModel =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);
