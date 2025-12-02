import express from "express"
import { connectDb } from "./config/db.js"
import bloomfilterProject from "./model/bloomfilterProject.js";
import dotenv from "dotenv"
import { responseTimer } from "./middleware/responseTimer.js";
import { initBloomFilter } from "./utility/initBloomFilter.js";
import { getBloomFilter } from "./utility/initBloomFilter.js";
dotenv.config();
const app = express();
connectDb();
const PORT = 3000;
app.use(express.json());
app.use(responseTimer);

await initBloomFilter();

app.get("/test",async(req,res)=>{
    const testUrl = await bloomfilterProject.find().limit(10);
    res.json(testUrl);
})

app.get("/count",async(req,res)=>{
    const count = await bloomfilterProject.countDocuments();
    res.json({count})
})

app.get("/check",(req,res)=>{
    const url = "http://phishingurl.com";
    const bf = getBloomFilter();
    const result = bf.contains(url);
    res.json({
        url,
        possibleMalicious:result
    })
})

app.get("/find",async(req,res)=>{
    const fetchUrl = await bloomfilterProject.find({url:"http://localhost:8000"}).lean();
    res.json({fetchUrl})
})

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})