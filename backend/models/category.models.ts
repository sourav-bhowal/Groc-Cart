import mongoose, { Schema, Document } from "mongoose";

// Category Interface
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category Schema
const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

// Export Category Model
export const CategoryModel =
  (mongoose.models.Category as mongoose.Model<ICategory>) ||
  mongoose.model<ICategory>("Category", CategorySchema);
