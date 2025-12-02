import BloomFilter from "./bloomfilter.js";
import bloomfilterProject from "../model/bloomfilterProject.js";
import bloomfilterArray from "../model/bloomfilterArray.js";

let bloomFilter;

export const initBloomFilter = async ()=>{
    const doc = await bloomfilterArray.findOne();
    if(!doc) throw new Error("Bloom filter not found in DB");
    console.log(doc)
    bloomFilter = new BloomFilter(doc.size,doc.hashCount);
    bloomFilter.bits = new Uint8Array(doc.bitArray.buffer);

    console.log("Bloom filter loaded in memory");
}

export const getBloomFilter = ()=>bloomFilter;