import express from "express"
import { connectDb } from "./config/db.js"
import bloomfilterProject from "./model/bloomfilterProject.js";
import path from "path"
import dotenv from "dotenv"
import { responseTimer } from "./middleware/responseTimer.js";
import { initBloomFilter } from "./utility/initBloomFilter.js";
import { getBloomFilter } from "./utility/initBloomFilter.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
dotenv.config();
const app = express();
connectDb();
const PORT = process.env.PORT;
app.use(express.json());
app.set("view engine","ejs");
app.set("views",path.join(process.cwd(),"views"))
app.use(express.static("public"))
await initBloomFilter();
app.use("/check",apiLimiter)
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

app.get("/check", async (req, res) => {
    const startTime = performance.now();
    const url = req.query.url;
    const bf = await getBloomFilter();
    const result = bf.contains(url);

    const endTime = performance.now();
    const responseTime = (endTime - startTime).toFixed(2);
    
    if (result) {
        return res.json({
            message: "Malicious",
            responseTime: `${responseTime} ms`
        });
    }
    res.json({
        message: "Safe",
        responseTime: `${responseTime} ms`
    });
});


app.get("/find",async(req,res)=>{
    const startTime = performance.now();
    const url = req.query.url;
    const fetchUrl = await bloomfilterProject.find({url:`${url}`}).lean();
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

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})