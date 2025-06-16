import mongoose, { Schema, Document } from "mongoose";

// Counter Interface
export interface ICounter extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  sequenceValue: number; // Current sequence value
}

// Counter Schema
const CounterSchema: Schema<ICounter> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    sequenceValue: { type: Number, default: 0 }, // Default starting value
  },
  {
    timestamps: true,
  }
);

// Export Counter Model
export const CounterModel =
  (mongoose.models.Counter as mongoose.Model<ICounter>) ||
  mongoose.model<ICounter>("Counter", CounterSchema);
