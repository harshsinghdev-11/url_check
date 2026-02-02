import bloomfilterProject from "../model/bloomfilterProject.js";

export const findUrlInDB = async(req,res)=>{
    try {
          const startTime = performance.now();
          const url = req.query.url;
      
          //it is a db call
          const fetchUrl = await bloomfilterProject.find({url}).lean();
      
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
      } catch (error) {
        res.status(500).json({
            message:"Internal Error"
        })
      }
}