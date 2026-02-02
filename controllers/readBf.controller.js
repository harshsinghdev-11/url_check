import { getBloomFilter } from "../utility/initBloomFilter.js";
import cache from "../utility/initLRU.js"
import bloomfilterProject from "../model/bloomfilterProject.js";




export const readBf = async(req,res)=>{
     try {
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
                message:"Malicious",
                responseTime: `${(endTime - startTime).toFixed(2)} ms`
            });
        }
       const record = await bloomfilterProject.findOne({url}).lean();
    
       let result;
        if(record){
            result = record.type;
        }else{
            result = "Safe";
        }
        cache.put(normalizedUrl,result);
        const endTime = performance.now();
        return res.json({
            message:result,
            responseTime: `${(endTime - startTime).toFixed(2)} ms`
        })
      } catch (error) {
        res.status(500).json({
            message:"Internal Error"
        })
      }
}