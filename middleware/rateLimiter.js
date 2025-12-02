import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs:10*60*1000,
    max:60,
    message:{
        status:429,
        error:"Too many requests."
    },
    standardHeaders:true,
    legacyHeaders:false
})