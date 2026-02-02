import bloomfilterProject from "../model/bloomfilterProject.js";


export const testUrl = async(req,res)=>{
      try {
            const sample = await bloomfilterProject.find({},{url:1,type:1,_id:0}).limit(10).lean();
    
            res.status(200).json({
                status:"ok",
                sampleCount:sample.length,
                sample
            })
        } catch (error) {
            res.status(500).json({
                status:"error",
                message:"DB health check failed",
                error:error.message
            })
        }
}

export const totalUrl = async(req,res)=>{
      try {
            const count = await bloomfilterProject.countDocuments();
            res.status(200).json({
                status:"ok",
                totalUrls:count
            })
        } catch (error) {
            res.status(500).json({
                status:"error",
                message:"Count failed",
                error:error.message
            })
        }
}