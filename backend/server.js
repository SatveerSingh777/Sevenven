require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 5500;

const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

app.use(express.json());
app.use(cors({ origin: "https://sevenven.onrender.com" }));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/api/ai", async (req, res) => {
  if (!apiToken || !accountId) {
    return res.status(500).json({ error: "Missing API credentials in environment variables." });
  }

try {
  const body = {
    max_tokens: 4096,      
    ...req.body,            
  };

  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    body,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  res.json(response.data);
} catch (error) {
    console.error("Error fetching data:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch AI response." });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});