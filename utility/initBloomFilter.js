import BloomFilter from "./bloomfilter.js";
import bloomfilterProject from "../model/bloomfilterProject.js";
import bloomfilterArray from "../model/bloomfilterArray.js";

let bloomFilter;

export const initBloomFilter = async ()=>{
    const doc = await bloomfilterArray.findOne();
    if(!doc) throw new Error("Bloom filter not found in DB");
  
    bloomFilter = new BloomFilter(doc.size,doc.hashCount);
    bloomFilter.bits = new Uint8Array(doc.bitArray.buffer);

  
}

export const getBloomFilter = ()=>bloomFilter;