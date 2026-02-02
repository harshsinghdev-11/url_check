import cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;

console.log(numCPUs);

if(numCPUs === 1){
   import ("./index.js");
}else{
    if(cluster.isPrimary){
        console.log(`Primary ${process.pid} running`);
        console.log(`Forking ${numCPUs} workers...\n`);

        for(let i=0;i<numCPUs;i++){
            cluster.fork();
        }
        cluster.on("exit",(worker)=>{
            console.log(`Worker ${worker.process.pid} died. Restarting...`);
            cluster.fork();
        })
    }else{
        import("./index.js");
    }
}