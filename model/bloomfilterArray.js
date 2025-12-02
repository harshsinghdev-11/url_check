import mongoose from "mongoose";

const bloomfilterArray = new mongoose.Schema({
    
    bitArray: {
        type: Buffer,   // stores Uint8Array
        required: true
    },
    size: {
        type: Number,
        required: true    // total bits (m)
    },
    hashCount: {
        type: Number,
        required: true    // number of hashes (k)
    },
    totalUrls: {
        type: Number,
        required: true
    },
    falsePositiveRate: {
        type: Number,
        default: 0.01
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("bloomfilterArray",bloomfilterArray);