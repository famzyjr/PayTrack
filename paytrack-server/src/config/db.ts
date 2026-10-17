
import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is missing from environment variables");
  }

  // Temporary diagnostic: use Google's DNS for Node.js lookups.
  dns.setServers(["8.8.8.8", "8.8.4.4"]);

  await mongoose.connect(mongoURI);

  console.log("MongoDB connected successfully");
};

export default connectDB;
