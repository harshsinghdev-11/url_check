import mongoose from "mongoose";
export const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Db connected")
    } catch (error) {
        console.log("Error while connecting db: ",error);
        process.exit(1);
    }
}