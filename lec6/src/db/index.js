import mongoose from "mongoose";
import { MONGO_DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInvent = mongoose.connect(
      `${process.env.MONGO_URI}/${MONGO_DB_NAME}`
    );

    console.log(`MongoDB connected DB host: ${connectionInvent}`); // yaha mongodb ka username and pass nahi hai uske liye 0.11 dolar lg raha hai\
  } catch (error) {
    console.log("error will come in this section ", error);
    throw error;
  }
};
export default connectDB;
