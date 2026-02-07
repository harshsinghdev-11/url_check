import mongoose from "mongoose";
import dotenv from "dotenv";
import BloomFilter from "./bloomfilter.js";
import bloomfilterProject from "../model/bloomfilterProject.js";
import bloomfilterArray from "../model/bloomfilterArray.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const HASH_COUNT = 7;
const BITS_PER_ITEM = 15;

const buildBloomFilters = async () => {
  try {

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");


    const [maliciousCount, benignCount] = await Promise.all([
      bloomfilterProject.countDocuments({
        type: { $in: ["phishing", "malware", "defacement"] }
      }),
      bloomfilterProject.countDocuments({ type: "benign" })
    ]);


    const maliciousBloom = new BloomFilter(
      Math.ceil(maliciousCount * BITS_PER_ITEM),
      HASH_COUNT
    );

    const benignBloom = new BloomFilter(
      Math.ceil(benignCount * BITS_PER_ITEM),
      HASH_COUNT
    );


    const cursor = bloomfilterProject.find(
      { type: { $in: ["benign", "phishing", "malware", "defacement"] } },
      { url: 1, type: 1 }
    ).cursor();

    let maliciousInserted = 0;
    let benignInserted = 0;

    for await (const doc of cursor) {
      if (!doc?.url) continue;

      if (doc.type === "benign") {
        benignBloom.add(doc.url);
        benignInserted++;
      } else {
        maliciousBloom.add(doc.url);
        maliciousInserted++;
      }

      if ((maliciousInserted + benignInserted) % 50000 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }


    await bloomfilterArray.deleteMany({});

    await bloomfilterArray.insertMany([
      {
        type: "MALICIOUS",
        bitArray: Buffer.from(maliciousBloom.bits),
        size: maliciousBloom.size,
        hashCount: HASH_COUNT,
        totalUrls: maliciousInserted,
        createdAt: new Date()
      },
      {
        type: "BENIGN",
        bitArray: Buffer.from(benignBloom.bits),
        size: benignBloom.size,
        hashCount: HASH_COUNT,
        totalUrls: benignInserted,
        createdAt: new Date()
      }
    ]);

    console.log("Bloom filters stored successfully");
  } catch (err) {
    console.error("Bloom build failed:", err);
  } finally {
    await mongoose.connection.close();
  }
};

buildBloomFilters();
