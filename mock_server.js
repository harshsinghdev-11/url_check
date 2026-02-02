import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index");
});

// Mock /check endpoint
app.get("/check", (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "No URL" });

    // Mock logic
    if (url.includes("safe")) {
        res.json({ message: "Safe", responseTime: "10.00 ms" });
    } else if (url.includes("phish")) {
        res.json({ message: "Phishing", responseTime: "12.50 ms" });
    } else {
        res.json({ message: "Malicious", responseTime: "15.00 ms" });
    }
});

// Mock /find endpoint
app.get("/find", (req, res) => {
    const url = req.query.url;
     if (!url) return res.status(400).json({ error: "No URL" });

    if (url.includes("safe")) {
        res.json({ message: "Safe", responseTime: "20.00 ms" });
    } else {
         res.json({ message: "Malware", responseTime: "25.00 ms" });
    }
});

app.listen(3001, () => {
    console.log("Mock server running on port 3001");
});
