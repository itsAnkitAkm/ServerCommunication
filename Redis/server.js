
import express from "express";
import axios from "axios";
import { createClient } from "redis";

const app = express();
const PORT = 9000;

// Create Redis client
const client = createClient();

client.on("error", (err) => console.error("Redis Client Error", err));

await client.connect();

// Route: GET /
app.get("/", async (req, res) => {
  try {
    const cacheKey = "posts"; // single key for demo

    // 1. Check cache first
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      console.log("✅ Serving from Redis Cache");
      return res.json(JSON.parse(cachedData));
    }

    // 2. If not in cache → fetch from API
    console.log("🌐 Fetching from JSONPlaceholder API...");
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts");

    // 3. Save response in Redis (set expiry 60 sec)
    await client.setEx(cacheKey, 60, JSON.stringify(data));

    return res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
