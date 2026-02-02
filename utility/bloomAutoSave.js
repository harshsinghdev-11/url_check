import bloomfilterProject from "../model/bloomfilterArray.js";
import { getBloomFilter } from "./initBloomFilter.js";

export const startBloomAutoSave = ()=>{
    setInterval(async ()=>{
        const bf = getBloomFilter();
        if (!bf || !bf.isDirty) return;
        try {
            await bloomfilterProject.updateOne(
                {},
                {bitArray:Buffer.from(bf.bits)}
            );
            bf.isDirty = false;

        } catch (error) {
            console.log("Bloom auto-save failed",error);
        }
    },10000);
}