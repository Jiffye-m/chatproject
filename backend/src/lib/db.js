import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const { MONGODB_URI } = ENV;
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log("MONGODB CONNECTED:", conn.connection.host);
  } catch (error) {
    console.error("Error connection to MONGODB:", error);
    process.exit(1); // 1 status code means fail, 0 means success
  }
};
