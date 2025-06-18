import "dotenv/config";
import fastifySession, {
  type FastifySessionObject,
  type FastifySessionOptions,
} from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { COOKIE_SECRET, MONGODB_URI } from "./config";
import { AdminModel } from "../models/user.models";
import AdminJS from "adminjs";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.models";
import { dark, light, noSidebar } from "@adminjs/themes";
import type { FastifyInstance } from "fastify";
import AdminJSFastify, { type AuthenticationOptions } from "@adminjs/fastify";

const MongoDBStore = ConnectMongoDBSession(fastifySession as any);

const sessionStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  databaseName: "groc-cart",
});

sessionStore.on("error", (error) => {
  console.log("Session store error:", error);
});

const authenticate = async (email: string, password: string) => {
  // Check if the provided email and password match the admin credentials
  if (email && password) {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return { email, password }; // Return an object representing the admin user
    } else {
      return null; // Authentication failed
    }
  }

  // if (email && password) {
  //   const admin = await AdminModel.findOne({ email });

  //   if (!admin) {
  //     return null; // Admin not found
  //   }

  //   if (admin.password === password) {
  //     return Promise.resolve(admin); // Authentication successful
  //   } else {
  //     return null; // Password mismatch
  //   }
  // }

  return null; // Authentication failed
};

// Register the Mongoose adapter with AdminJS
AdminJS.registerAdapter(AdminJSMongoose);

// Create an instance of AdminJS with the necessary configuration
export const admin = new AdminJS({
  resources: [
    {
      resource: Models.CustomerModel,
      options: {
        listProperties: ["userName", "role", "phoneNumber", "isActive"],
        filterProperties: ["phoneNumber", "role"],
      },
    },
    {
      resource: Models.DeliveryPartnerModel,
      options: {
        listProperties: ["userName", "role", "isActive", "email"],
        filterProperties: ["email", "role"],
      },
    },
    {
      resource: Models.AdminModel,
      options: {
        listProperties: ["userName", "role", "isActive", "email"],
        filterProperties: ["email", "role"],
      },
    },
    {
      resource: Models.BranchModel,
    },
    {
      resource: Models.ProductModel,
    },
    {
      resource: Models.OrderModel,
    },
    {
      resource: Models.CounterModel,
    },
    {
      resource: Models.CategoryModel,
    },
  ],
  branding: {
    companyName: "Groc Cart",
    withMadeWithLove: false,
  },
  defaultTheme: dark.id,
  availableThemes: [dark, light, noSidebar],
  rootPath: "/admin",
});

// Define the session options for Fastify
const sessionOptions: FastifySessionOptions = {
  secret: COOKIE_SECRET,
  cookieName: "adminjs",
  cookie: {
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    httpOnly: process.env.NODE_ENV === "production", // Prevent client-side access to the cookie
    sameSite: "lax",
  },
  saveUninitialized: true,
  store: sessionStore,
};

// Authentication options for AdminJS
const authOptions: AuthenticationOptions = {
  authenticate,
  cookieName: "adminjs",
  cookiePassword: COOKIE_SECRET,
};

// Export Route for AdminJS
export const adminRouter = async (server: FastifyInstance) => {
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    authOptions,
    server,
    sessionOptions
  );
};
