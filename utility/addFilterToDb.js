import mongoose from "mongoose";
import bloomfilterArray from "../model/bloomfilterArray.js";
import bloomfilterProject from "../model/bloomfilterProject.js";
import BloomFilter from "./bloomfilter.js";
import { connectDb } from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI=process.env.MONGO_URI;
const buildBloomFilter = async ()=>{
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Db connected")
    const totalDoc = await bloomfilterProject.countDocuments();

    const size = Math.ceil(totalDoc * 15);  // good approx
    const hashCount = 7;

    const bloom = new BloomFilter(size, hashCount);

    const cursor = bloomfilterProject.find({},{url:1}).cursor();

    let processed = 0;
    for await (const doc of cursor) {
        bloom.add(doc.url);
        processed++;

        if (processed % 50000 === 0) {
            console.log("Processed:", processed);
            await new Promise(resolve => setTimeout(resolve, 0)); // yield event loop
        }
    }

    console.log("Finished processing:", processed);

    const bloomDoc = new bloomfilterArray({
        bitArray:Buffer.from(bloom.bits),
        hashCount:7,
        totalUrls:totalDoc,
        size,
    })
    await bloomfilterArray.deleteMany({});
    await bloomDoc.save();
    mongoose.connection.close();
}
buildBloomFilter();