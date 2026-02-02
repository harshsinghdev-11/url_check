import express from "express"

import path from "path"
import dotenv from "dotenv"

import { connectDb } from "./config/db.js"

//bloom filter related
import bloomfilterProject from "./model/bloomfilterProject.js";
import { initBloomFilter } from "./utility/initBloomFilter.js";
import { getBloomFilter } from "./utility/initBloomFilter.js";
import {startBloomAutoSave} from "./utility/bloomAutoSave.js";

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
startBloomAutoSave();

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
app.post("/addUrl", async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const bf = getBloomFilter();
        if (!bf) {
            return res.status(500).json({ error: "Bloom filter not initialized" });
        }

        
        const normalizedUrl = url.trim().toLowerCase();

        const alreadyExists = bf.contains(normalizedUrl);
        bf.add(normalizedUrl);

        return res.status(200).json({
            message: alreadyExists
                ? "URL probably already present in Bloom Filter"
                : "URL added to Bloom Filter",
            alreadyExists
        });

    } catch (err) {
        console.error("Add URL error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
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



const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})