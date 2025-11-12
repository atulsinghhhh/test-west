import mongoose from 'mongoose'
import dotenv from "dotenv"
dotenv.config();

export const dbConnect = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL!}/testwest`);
        console.log(`Database is successful connect to mongoDB ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log(`Database is failed to connect mongoDB ${error}`);
        process.exit(1);
    }
}
