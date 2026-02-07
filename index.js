import express from "express"

import path from "path"
import dotenv from "dotenv"

import { connectDb } from "./config/db.js"

//bloom filter related
import bloomfilterProject from "./model/bloomfilterProject.js";
import { initBloomFilters } from "./utility/initBloomFilter.js";

//for auto save
// import {startBloomAutoSave} from "./utility/bloomAutoSave.js";

//rate limiter
import { apiLimiter } from "./middleware/rateLimiter.js";

//importing cache

import cache from "./utility/initLRU.js"

dotenv.config();
const app = express();
await connectDb();

//routes 
import healthCheckRouter from "./routes/healthCheckRoutes.js";
import readBfRoutes from "./routes/readBfRoutes.js";
// import writeBfRoutes from "./routes/writeBfRoutes.js";
import dbReadRoutes from "./routes/dbReadRoutes.js";


//middlewares
app.use(express.json());
app.set("view engine","ejs");
app.set("views",path.join(process.cwd(),"views"))
app.use(express.static("public"))
app.use(apiLimiter);


//init bloom filter
await initBloomFilters();
// startBloomAutoSave();


//home routes

app.get("/",(req,res)=>{
    res.render("index")
})



app.use(healthCheckRouter);
app.use(readBfRoutes);
// app.use(writeBfRoutes);

//without bloom filter query
//db call
app.use(dbReadRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})