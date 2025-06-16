import mongoose, { Schema, Document, Types } from "mongoose";

// Base User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  role: "Admin" | "Customer" | "DeliveryPartner";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Base User Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Customer", "DeliveryPartner"],
    },
    isActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Export User Model
export const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

// Extended Customer Interface
export interface ICustomer extends IUser {
  phoneNumber: number;
  liveLocation: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

// Merge User fields with Customer fields
const CustomerSchema: Schema<ICustomer> = new Schema({
  phoneNumber: { type: Number, required: true, unique: true },
  liveLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  address: { type: String },
  role: {
    type: String,
    required: true,
    enum: ["Customer"], // Overriding role to be Customer only
    default: "Customer",
  },
});

// Merge User Schema with Customer Schema
CustomerSchema.add(UserSchema);

// Export Customer Model
export const CustomerModel =
  (mongoose.models.Customer as mongoose.Model<ICustomer>) ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

// Extended Delivery Partner Interface
export interface IDeliveryPartner extends IUser {
  email: string;
  password: string;
  phoneNumber: number;
  vehicleType: string;
  liveLocation: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  branch: Types.ObjectId; // Reference to Branch model
}

// Merge User fields with Delivery Partner fields
const DeliveryPartnerSchema: Schema<IDeliveryPartner> = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: Number, required: true, unique: true },
  vehicleType: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["DeliveryPartner"], // Overriding role to be DeliveryPartner only
    default: "DeliveryPartner",
  },
  liveLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  address: { type: String },
  branch: {
    type: Schema.Types.ObjectId,
    ref: "Branch", // Assuming Branch is another model
    required: true,
  },
});

// Merge User Schema with Delivery Partner Schema
DeliveryPartnerSchema.add(UserSchema);

// Export Delivery Partner Model
export const DeliveryPartnerModel =
  (mongoose.models.DeliveryPartner as mongoose.Model<IDeliveryPartner>) ||
  mongoose.model<IDeliveryPartner>("DeliveryPartner", DeliveryPartnerSchema);

// Extended Admin Interface
export interface IAdmin extends IUser {}

// Merge User fields with Admin fields
const AdminSchema: Schema<IAdmin> = new Schema({
  role: {
    type: String,
    required: true,
    enum: ["Admin"], // Overriding role to be Admin only
    default: "Admin",
  },
});

// Merge User Schema with Admin Schema
AdminSchema.add(UserSchema);

// Export Admin Model
export const AdminModel =
  (mongoose.models.Admin as mongoose.Model<IAdmin>) ||
  mongoose.model<IAdmin>("Admin", AdminSchema);
