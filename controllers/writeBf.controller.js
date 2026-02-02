import { getBloomFilter } from "../utility/initBloomFilter.js";

export const writeBf  = async(req,res)=>{
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
}