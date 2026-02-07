import express from 'express';
import ort from "onnxruntime-node"

const app = express();


// Middleware to parse JSON bodies
app.use(express.json());

const LABELS = ['benign', 'defacement', 'malware', 'phishing'];
let session;

// 1. Load the ONNX model once when the server starts
async function initModel() {
    try {
       const options = {
            executionMode: "parallel", // or "sequential"
            graphOptimizationLevel: "all", // Change to "basic" for faster loading
        };
        session = await ort.InferenceSession.create('./url_phish_model (2).onnx', options);
        console.log("✅ ONNX Model loaded.");
    } catch (e) {
        console.error("❌ Failed to load ONNX model:", e);
        process.exit(1);
    }
}

// 2. Feature Extraction (Mirrored from your Python logic)
function extractFeatures(url) {
    const suspiciousKeywords = ['login', 'signin', 'verify', 'update', 'banking', 'account', 'secure', 'ebay', 'paypal'];
    const commonTLDs = ['com', 'org', 'net', 'edu', 'gov'];
    const tld = url.split('.').pop();

    return [
        url.length,
        (url.match(/\d/g) || []).length,
        (url.match(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g) || []).length,
        Math.max(0, (url.split('.').length - 1) - 1),
        /\d+\.\d+\.\d+\.\d+/.test(url) ? 1 : 0,
        url.toLowerCase().includes('https') ? 1 : 0,
        (url.match(/\?/g) || []).length,
        (url.match(/#/g) || []).length,
        (url.match(/\/+/g) || []).length, // Counting slashes
        suspiciousKeywords.some(word => url.toLowerCase().includes(word)) ? 1 : 0,
        tld.length,
        commonTLDs.includes(tld) ? 1 : 0,
        /%[0-9a-fA-F]{2}/.test(url) ? 1 : 0,
        /(.)\1{3,}/.test(url) ? 1 : 0
    ];
}

// 3. The API Endpoint
app.get('/predict', async (req, res) => {
    const  url  = req.query.url;

    if (!url) {
        return res.status(400).json({ error: "Please provide a 'url' in the request body." });
    }

    try {
        const features = extractFeatures(url);
        const inputTensor = new ort.Tensor('float32', Float32Array.from(features), [1, 14]);
        
        // Execute inference
        const results = await session.run({ float_input: inputTensor });
        
        const labelIndex = results.label.data[0];
        const probabilities = results.probabilities.data;

        res.json({
            url: url,
            prediction: LABELS[labelIndex],
            confidence: `${(probabilities[labelIndex] * 100).toFixed(2)}%`,
            all_probabilities: {
                benign: probabilities[0],
                defacement: probabilities[1],
                malware: probabilities[2],
                phishing: probabilities[3]
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Inference failed", details: err.message });
    }
});
await initModel();

app.listen(3000,()=>{
    console.log("server is running already");
})