import "dotenv/config";
import fastifySession from "@fastify/session";
import { MongoDBStore } from "connect-mongodb-session";
import { MONGODB_URI } from "./config";
import { AdminModel } from "../models/user.models";

// export const sessionStore = new MongoDBStore({
//   uri: MONGODB_URI,
//   collection: "sessions",
// });

// sessionStore.on("error", (error) => {
//   console.log("Session store error:", error);
// });

export const authAdmin = async (email: string, password: string) => {
  // Check if the provided email and password match the admin credentials
  // if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
  //   return true; // Authentication successful
  // }

  if (email && password) {
    const admin = await AdminModel.findOne({ email });

    if (!admin) {
      return null; // Admin not found
    }

    if (admin.password === password) {
      return Promise.resolve(admin); // Authentication successful
    } else {
      return null; // Password mismatch
    }
  }

  return null; // Authentication failed
};
