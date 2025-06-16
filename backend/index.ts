import "dotenv/config";
import { connectDB } from "./database/db";
import fastify, { type FastifyInstance } from "fastify";
import { HOST, PORT } from "./config/config";

// Function to initialize the server
const startServer = async () => {
  // Connect to the database
  await connectDB();

  // Create a Fastify instance
  const server: FastifyInstance = fastify();

  // Listen on port and handle errors
  server.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
      server.log.error("Error starting server:", err);
      process.exit(1);
    }
    console.log(`Server is running at ${address}`);
  });
};

// Start the server
startServer();
