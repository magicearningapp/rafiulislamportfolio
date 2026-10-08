import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 50MB limit to handle high-res photos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialize GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to call Gemini with model fallback (gemini-3.8-flash -> gemini-flash-latest -> gemini-3.1-flash-lite)
async function generateContentWithFallback(
  ai: GoogleGenAI,
  cleanBase64: string,
  mimeType: string,
  prompt: string
) {
  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errorMsg = err?.message || String(err);
      const isHighDemandOrTransient =
        errorMsg.includes("503") ||
        errorMsg.includes("high demand") ||
        errorMsg.includes("UNAVAILABLE") ||
        errorMsg.includes("429") ||
        errorMsg.includes("RESOURCE_EXHAUSTED");

      console.warn(
        `Gemini model ${model} temporarily unavailable (${isHighDemandOrTransient ? "503/high demand" : errorMsg}). Trying fallback model...`
      );

      if (isHighDemandOrTransient) {
        // Small backoff before trying fallback
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError;
}

// Health check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gemini AI Photo Analysis API
app.post("/api/gemini/analyze-photo", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", fileName = "", isAlbum = false, albumPhotoCount = 1 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 in request" });
    }

    // Detect actual MIME type from data URL if present
    let detectedMime = mimeType;
    const mimeMatch = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (mimeMatch) {
      detectedMime = mimeMatch[1];
    }

    // Standardize to supported formats (jpeg, png, webp)
    if (!["image/jpeg", "image/png", "image/webp"].includes(detectedMime)) {
      detectedMime = "image/jpeg";
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const ai = getAi();
    const prompt = `You are an expert photography curator, visual storyteller, and creative director for Md. Rafiul Islam, a professional photographer and content creator based in Bangladesh.
Carefully examine this photograph ${isAlbum ? `(which is the cover of a ${albumPhotoCount}-photo album/series)` : ""} and generate aesthetic, thoughtful metadata:

1. "title": A striking, evocative, artistic ${isAlbum ? "album/series title (e.g., 'Golden Twilight Series', 'Chalan Beel Chronicles', 'Faces of Old Town')" : "photo title (3-6 words, professional & memorable)"}.
2. "caption": A captivating narrative caption describing the scene, lighting (e.g. golden hour, moody, rim light), atmosphere, visual composition, and aesthetic emotion ${isAlbum ? `introducing this ${albumPhotoCount}-photo album collection` : ""}(2-3 sentences).
3. "category": Choose the single most fitting category from: "Street", "Portrait", "Nature", "Landscape", "Architecture", "Travel", "Urban", "Macro", "Monochrome", "Lifestyle", "Heritage", "Aerial".
4. "tags": An array of 4-6 concise lowercase tags (e.g. ["golden-hour", "street-story", "monsoon", "vintage-tone", "heritage"${isAlbum ? ', "photo-series", "album"' : ''}]).
5. "location": If you observe specific landmarks, cultural architecture, or South Asian/Bangladesh geographical indicators, suggest a realistic location (e.g. "Old Dhaka, Bangladesh", "Pabna, Bangladesh", "Sylhet Tea Estate", "Cox's Bazar Seashore", "Rural Riverbank, Bengal", etc.). If ambiguous, provide a fitting atmospheric location (e.g. "Heritage Quarter", "Quiet Lakeside", "Historic District").
6. "date": Today's date or estimated season/month.

Return ONLY a valid JSON object with keys "title", "caption", "category", "tags", "location", "date". No markdown formatting or extra text.`;

    const response = await generateContentWithFallback(ai, cleanBase64, detectedMime, prompt);

    const text = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(text.trim().replace(/^```json\s*/, "").replace(/```$/, ""));
    } catch {
      parsedData = {
        title: fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Ethereal Capture",
        caption: text.slice(0, 200),
        category: "Photography",
        tags: ["photography", "visuals", "art"],
        location: "Bangladesh",
      };
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.warn("Gemini Photo Analysis notice:", error?.message || error);
    // Return friendly starter metadata if API models are experiencing temporary demand spikes
    const fallbackName = req.body?.fileName
      ? String(req.body.fileName).replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      : "Moment Captured";

    return res.status(200).json({
      success: false,
      error: error?.message || "AI analysis temporarily unavailable",
      data: {
        title: fallbackName,
        caption: "A timeless visual capture showcasing light, depth, and human connection through the lens.",
        category: "Street",
        tags: ["photography", "moments", "storytelling"],
        location: "Bangladesh",
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      },
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
