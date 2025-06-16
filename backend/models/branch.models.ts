import mongoose, { Schema, Document } from "mongoose";

// Branch Interface
export interface IBranch extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  liveLocation?: {
    latitude: number;
    longitude: number;
  };
  deliveryPartners: mongoose.Types.ObjectId[]; // Array of references to Delivery Partner
  createdAt: Date;
  updatedAt: Date;
}

// Branch Schema
const BranchSchema: Schema<IBranch> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    deliveryPartners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryPartner",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export Branch Model
export const BranchModel =
  (mongoose.models.Branch as mongoose.Model<IBranch>) ||
  mongoose.model<IBranch>("Branch", BranchSchema);
