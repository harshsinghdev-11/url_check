import { getMaliciousBloomFilter, getBenignBloomFilter } from "../utility/initBloomFilter.js";
import cache from "../utility/initLRU.js";
import bloomfilterProject from "../model/bloomfilterProject.js";
import ort from "onnxruntime-node";
import { performance } from "perf_hooks";
import { url } from "inspector";

const LABELS = ["benign", "defacement", "malware", "phishing"];

let session;

/* ---------------- ONNX INIT ---------------- */

async function initModel() {
  if (session) return;
  session = await ort.InferenceSession.create("./final_url_model.onnx");
  console.log("ONNX model loaded");
}

/* ---------------- URL HELPERS ---------------- */

function safeParseUrl(input) {
  try {
    return new URL(input);
  } catch {
    try {
      return new URL("http://" + input);
    } catch {
      return null;
    }
  }
}

function normalizeUrl(parsed) {
  return parsed.href.replace(/\/$/, "").toLowerCase();
}

/* ---------------- FEATURE EXTRACTION ---------------- */

function extractFeatures(url) {
  const suspiciousKeywords = [
    "login","signin","verify","update","bank","account","secure","paypal","ebay"
  ];
  const commonTLDs = ["com","org","net","edu","gov"];

  const parsed = safeParseUrl(url);
  if (!parsed) return null;

  const normalized = url.toLowerCase();
  const hostname = parsed.hostname;
  const parts = hostname.split(".");
  const tld = parts.slice(-2).join(".");

  return [
    normalized.length,
    (normalized.match(/\d/g) || []).length,
    (normalized.match(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g) || []).length,
    Math.max(0, parts.length - 2),
    /\d+\.\d+\.\d+\.\d+/.test(hostname) ? 1 : 0,
    parsed.protocol === "https:" ? 1 : 0,
    (parsed.search.match(/\?/g) || []).length,
    (parsed.hash.match(/#/g) || []).length,
    (normalized.match(/\//g) || []).length,
    suspiciousKeywords.some(k => normalized.includes(k)) ? 1 : 0,
    tld.length,
    commonTLDs.includes(tld) ? 1 : 0,
    /%[0-9a-fA-F]{2}/.test(normalized) ? 1 : 0,
    /(.)\1{3,}/.test(normalized) ? 1 : 0
  ];
}

/* ---------------- CONTROLLER ---------------- */

export const readBf = async (req, res) => {
  const startTime = performance.now();

  try {
    const inputUrl = req.query.url;
    if (!inputUrl || typeof inputUrl !== "string") {
      return res.status(400).json({ message: "Invalid URL" });
    }

    const parsed = safeParseUrl(inputUrl);
    if (!parsed) {
      return res.status(400).json({
        message: "Invalid URL format",
        responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
      });
    }

    const key = req.query.url;

    /* ---------- CACHE ---------- */
    const cached = cache.get(key);
    if (cached !== null) {
     
      return res.json({
        message: cached,
        responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
      });
    }

    const maliciousBf = getMaliciousBloomFilter();
    const benignBf = getBenignBloomFilter();

    /* ---------- MALICIOUS BLOOM ---------- */
    const maliciousHit = maliciousBf.contains(key);
    if (maliciousHit) {
      const record = await bloomfilterProject.findOne({ url: key }).lean();
      if (record) {
        cache.put(key, record.type);
        
        return res.json({
          message: record.type,
          responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
        });
      }
    }

    /* ---------- BENIGN BLOOM ---------- */
    if (!maliciousHit && benignBf.contains(key)) {
      cache.put(key, "benign");
      
      return res.json({
        message: "benign",
        responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
      });
    }

    /* ---------- ML INFERENCE ---------- */
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
   
 
    return res.json({
        
      message: result,
      responseTime: `${(performance.now() - startTime).toFixed(2)} ms`
    });
  } catch (err) {
    console.error("Controller error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
