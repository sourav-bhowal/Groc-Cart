import mongoose, { Schema, Document } from "mongoose";
import { CounterModel } from "./counter.models";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderId?: string; // Optional unique order ID, can be generated using a sequence
  customer: mongoose.Types.ObjectId; // Reference to Customer
  deliveryPartner?: mongoose.Types.ObjectId; // Optional reference to Delivery Partner
  branch: mongoose.Types.ObjectId; // Reference to Branch
  items: {
    _id: mongoose.Types.ObjectId; // Unique ID for each item in the order
    product: mongoose.Types.ObjectId; // Reference to Product
    quantity: number;
  }[]; // Array of items in the order
  deliveryLocation: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  pickupLocation: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  deliveryPersonLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  totalPrice: number;
  status: "Available" | "Accepted" | "Arriving" | "Delivered" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      required: false,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    items: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    deliveryLocation: {
      address: { type: String, required: false },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    pickupLocation: {
      address: { type: String, required: false },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    deliveryPersonLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: false },
    },
    totalPrice: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["Available", "Accepted", "Arriving", "Delivered", "Cancelled"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

// Export Order Model
export const OrderModel =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", orderSchema);

// Function to get the next sequence value for order IDs
async function getNextSequenceValue(sequenceName: string): Promise<number> {
  const sequenceDocument = await CounterModel.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.sequenceValue;
}

// Pre-save hook to generate orderId if not provided
orderSchema.pre<IOrder>("save", async function (next) {
  if (!this.isNew) {
    try {
      const nextValue = await getNextSequenceValue("orderId"); // Get next sequence value for orderId
      this.orderId = `ORD-${nextValue.toString().padStart(6, "0")}`; // Format orderId as ORD-000001, ORD-000002, etc.
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});
