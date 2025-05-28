// pages/api/fetchPortrait.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { portraitUrl } = req.query;

  if (!portraitUrl) {
    return res.status(400).json({ error: "Missing portraitUrl" });
  }

  try {
    const imageRes = await fetch(portraitUrl);

    if (!imageRes.ok) {
      return res
        .status(502)
        .json({ error: "Failed to fetch portrait from FamilySearch" });
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imageRes.buffer();
    const base64 = `data:${contentType};base64,${buffer.toString("base64")}`;

    res.status(200).json({ base64 });
  } catch (err) {
    console.error("Portrait proxy error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
