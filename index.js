import express from "express"

import path from "path"
import dotenv from "dotenv"

import { connectDb } from "./config/db.js"
import bloomfilterProject from "./model/bloomfilterProject.js";
import { initBloomFilter } from "./utility/initBloomFilter.js";
import { getBloomFilter } from "./utility/initBloomFilter.js";

import { apiLimiter } from "./middleware/rateLimiter.js";

//importing cache

import cache from "./utility/initLRU.js"

dotenv.config();
const app = express();
connectDb();


//middlewares
app.use(express.json());
app.set("view engine","ejs");
app.set("views",path.join(process.cwd(),"views"))
app.use(express.static("public"))

//init bloom filter
await initBloomFilter();

//init cache


app.use("/find",apiLimiter)


app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/test",async(req,res)=>{
    const testUrl = await bloomfilterProject.find().limit(10);
    res.json(testUrl);
})

app.get("/count",async(req,res)=>{
    const count = await bloomfilterProject.countDocuments();
    res.json({count})
})

//bloom filter query
app.get("/check", async (req, res) => {
    const startTime = performance.now();
    const url = req.query.url;
    const bf = await getBloomFilter();
    const mayBeMalicious = bf.contains(url);

    if (!mayBeMalicious) {
        const endTime = performance.now();
        return res.json({
            message: "Safe",
            responseTime: `${(endTime - startTime).toFixed(2)} ms`
        });
    }
    const normalizedUrl = url.trim().toLowerCase();
    const cached = cache.get(normalizedUrl);
    if(cached){
        const endTime = performance.now();
        return res.json({
            message:"Not safe",
            type:cached,
            responseTime: `${(endTime - startTime).toFixed(2)} ms`
        });
    }
   const record = await bloomfilterProject.findOne({url}).lean();

   let result;
    if(record){
        result = record.type;
    }else{
        result:"Safe";
    }
    cache.put(normalizedUrl,result);
    const endTime = performance.now();
    return res.json({
        message:result,
        responseTime: `${(endTime - startTime).toFixed(2)} ms`
    })
});



//without bloom filter
app.get("/find",async(req,res)=>{
    const startTime = performance.now();
    const url = req.query.url;

    //it is a db call
    const fetchUrl = await bloomfilterProject.find({url:`${url}`}).lean();
    console.log(fetchUrl);
    const endTime = performance.now();
    
    const responseTime = (endTime - startTime).toFixed(2);
    if(fetchUrl.length>0){


        return res.json({
            message:"Malicious",
            responseTime: `${responseTime} ms`
        })
    }
    res.json({
        message: "Safe",
        responseTime: `${responseTime} ms`
    })
})



const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})