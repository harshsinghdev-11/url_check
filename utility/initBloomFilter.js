import BloomFilter from "./bloomfilter.js";
import BloomFilterModel from "../model/bloomfilterArray.js";

const bloomFilters = {
  MALICIOUS: null,
  BENIGN: null
};

export const initBloomFilters = async () => {
  const docs = await BloomFilterModel.find({
    type: { $in: ["MALICIOUS", "BENIGN"] }
  });

  if (docs.length !== 2) {
    throw new Error("Both MALICIOUS and BENIGN Bloom filters must exist in DB");
  }

  for (const doc of docs) {
    const bf = new BloomFilter(doc.size, doc.hashCount,doc.type);
    bf.bits = new Uint8Array(doc.bitArray.buffer);
    bloomFilters[doc.type] = bf;
  }

  console.log("Bloom filters added into memory");
};

export const getMaliciousBloomFilter = () => {
  if (!bloomFilters.MALICIOUS) {
    throw new Error("Malicious Bloom filter not initialized");
  }
  return bloomFilters.MALICIOUS;
};

export const getBenignBloomFilter = () => {
  if (!bloomFilters.BENIGN) {
    throw new Error("Benign Bloom filter not initialized");
  }
  return bloomFilters.BENIGN;
};
