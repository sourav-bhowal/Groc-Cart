import "dotenv/config";
import { connectDB } from "./database/db";
import fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import { HOST, MONGODB_URI, PORT } from "./config/config";
import cors from "@fastify/cors";
import fastifySocketIO from "fastify-socket.io";
import { Store } from "@voidpkg/fastify-mongo-store";
import { appRoutes } from "./routes/index.routes";
import fastifySession from "@fastify/session";

// Function to initialize the server
const startServer = async () => {
  // Connect to the database
  await connectDB();

  // Create a Fastify instance
  const server: FastifyInstance = fastify();

  // Register CORS plugin
  server.register(cors, {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  });

  // Register Socket.IO plugin
  server.register(fastifySocketIO, {
    cors: {
      origin: "*", // Allow all origins for Socket.IO
      methods: ["GET", "POST"],
    },
    pingInterval: 10000, // Ping interval for health checks
    pingTimeout: 5000, // Timeout for ping responses
    transports: ["websocket"], // Use both polling and websocket transports
  });

  // Register session management
  server.register(fastifySession, {
    secret: process.env.COOKIE_SECRET!,
    store: new Store({
      collection: "sessions", // Collection name for storing sessions
      url: MONGODB_URI, // MongoDB connection URI
      database: "groc-cart", // Database name
    }),
  });

  // Register application routes
  server.register(appRoutes);

  // Default route for testing server
  server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return { message: "Welcome to the Fastify API!" };
  });

  // Listen on port and handle errors
  server.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
      server.log.error("Error starting server:", err);
      process.exit(1);
    }
    console.log(`Server is running at ${address}`);
  });

  // Handle Socket.IO connections
  server.ready().then(() => {
    server.io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });

      // Example event listener
      socket.on("joinOrderRoom", (orderId: string) => {
        socket.join(orderId);
        console.log(`Client ${socket.id} joined room: ${orderId}`);
      });
    });
  });
};

// Start the server
startServer();
