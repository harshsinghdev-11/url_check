import mongoose from "mongoose";
export const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
    } catch (error) {
        console.log("Error while connecting db: ",error);
        process.exit(1);
    }
}