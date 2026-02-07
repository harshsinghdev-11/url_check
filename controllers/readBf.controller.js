import { getMaliciousBloomFilter,getBenignBloomFilter } from "../utility/initBloomFilter.js";
import cache from "../utility/initLRU.js"
import bloomfilterProject from "../model/bloomfilterProject.js";
import ort from "onnxruntime-node";
import { performance } from "perf_hooks";


const LABELS = ['benign', 'defacement', 'malware', 'phishing'];

let session;



async function initModel() {
    try {
        session = await ort.InferenceSession.create('./final_url_model.onnx');
        console.log("ONNX Model loaded successfully.");
    } catch (error) {
        console.error("Failed to load ONNX model:", error);
        process.exit(1);
    }
}

function safeParseUrl(input) {
  try {
    // Already absolute
    return new URL(input);
  } catch {
    try {
      // Try auto-prefixing
      return new URL("http://" + input);
    } catch {
      return null;
    }
  }
}


function extractFeatures(url) {
  const suspiciousKeywords = ['login', 'signin', 'verify', 'update', 'banking', 'account', 'secure', 'ebay', 'paypal'];
  const commonTLDs = ['com', 'org', 'net', 'edu', 'gov'];

  const parsed = safeParseUrl(url);
  if (!parsed) {
    // Return a neutral / low-signal feature vector
    return Array(14).fill(0);
  }

  const { hostname, search, hash, protocol } = parsed;
  const tld = hostname.split('.').pop();

  return [
    url.length,
    (url.match(/\d/g) || []).length,
    (url.match(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g) || []).length,
    Math.max(0, hostname.split('.').length - 2),
    /\d+\.\d+\.\d+\.\d+/.test(hostname) ? 1 : 0,
    protocol === "https:" ? 1 : 0,
    (search.match(/\?/g) || []).length,
    (hash.match(/#/g) || []).length,
    (url.match(/\//g) || []).length,
    suspiciousKeywords.some(word => url.includes(word)) ? 1 : 0,
    tld.length,
    commonTLDs.includes(tld) ? 1 : 0,
    /%[0-9a-fA-F]{2}/.test(url) ? 1 : 0,
    /(.)\1{3,}/.test(url) ? 1 : 0
  ];
}


export const readBf = async (req, res) => {
  try {
    const startTime = performance.now();

    const url = req.query.url;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "Invalid URL" });
    }
    const parsedUrl = safeParseUrl(url);
    if (!parsedUrl) {
        return res.status(400).json({
            message: "Invalid URL format",
            responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
    });}

    const key = url; //todo : normalised it later when I will rebuild 

    const cached = cache.get(key);
    if (cached) {
        console.log("response is from cache: "+cached);
      return res.json({
        message: cached,
        responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
      });
    }

    const maliciousBf = getMaliciousBloomFilter();
    const benignBf = getBenignBloomFilter();

    // 2️⃣ Malicious Bloom (routing only)
    if (maliciousBf.contains(key)) {
      const record = await bloomfilterProject.findOne({ url: key }).lean();
      if (record) {
        cache.put(key, record.type);
        return res.json({
          message: record.type,
          responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
        });
      }
      // fall through → ML
    }


    if (benignBf.contains(key)) {
      cache.put(key, "benign");
      return res.json({
        message: "benign",
        responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
      });
    }


    if (!session) await initModel();

    let result;
    const features = extractFeatures(key);
    const inputTensor = new ort.Tensor(
      "float32",
      Float32Array.from(features),
      [1, 14]
    );

    const feeds = {};
    feeds[session.inputNames[0]] = inputTensor;
    const results = await session.run(feeds);

    const labelIndex = results[session.outputNames[0]].data[0];
    result = LABELS[labelIndex];

    cache.put(key, result);
    console.log("result is from ml:");
    if(result){
        console.log(labelIndex);
    }
    return res.json({
        
      message: result,
      responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
    });

  }catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Error" });
  }
};
