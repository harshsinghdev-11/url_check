import lruCache from "../cache/lru.js";

let cache;

export const initCache = async()=>{
    cache = await new lruCache();
}



export const getcache = ()=>cache;
 

