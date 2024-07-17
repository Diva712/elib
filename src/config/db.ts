import mongoose from "mongoose";
import { config } from "./config";


const connectDB = async () => {
  try {
   mongoose.connection.on('connected', () => {
     console.log("Connected to database successfully !!")
   });

   mongoose.connection.on('error', (err) => {
     console.log("Error in connecting a database" , err)
   })



   await mongoose.connect(config.dburl as string);
   

 } catch (error) {
   console.error("Failed to Connect !!", error)
   process.exit(1);
 }
}

export default connectDB