import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function removePersonNamesViaLLM(text: string): Promise<string> {
  // If LLM key isn't present, use a conservative deterministic fallback
  if (!process.env.GEMINI_API_KEY) {
    try {
      // Redact common honorific patterns and obvious name mentions
      let fallback = text.replace(/\b(?:Mr|Ms|Mrs|Encik|Puan|Dato|Dato'|Dr)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, "[NAME REDACTED]");
      // Redact explicit labels like "Name: John Doe" or "Nama: John Doe"
      fallback = fallback.replace(/(?:Name|Nama|Nama\:)\s*:\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/gi, "[NAME REDACTED]");
      // Conservative rule: redact adjacent two-capitalized-word sequences (may over-redact sentence starts)
      fallback = fallback.replace(/(?<!\b(?:Mr|Ms|Mrs|Encik|Puan|Dato|Dr)\.?)\b[A-Z][a-z]{1,20}\s+[A-Z][a-z]{1,20}\b/g, "[NAME REDACTED]");
      return fallback;
    } catch (err) {
      console.error("Fallback redaction failed:", err);
      return text;
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a privacy redaction assistant. Your ONLY job is to take the following text and replace any proper human names (names of people) with "[NAME REDACTED]". Do not change any other text. Keep the original language and context intact. Only return the sanitized text, with no extra commentary or markdown.\n\nText: ${text}`;
    const result = await model.generateContent(prompt);
    const out = result.response.text().trim();
    // Ensure the LLM did not return an empty or unexpected response
    return out || text;
  } catch (error) {
    console.error("LLM Redaction failed:", error);
    return text;
  }
}

async function checkToxicityAndSpam(text: string): Promise<boolean> {
  // If no LLM key is available, be conservative and allow (do not falsely block).
  if (!process.env.GEMINI_API_KEY) return false;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the following text for toxicity, hate speech, spam, or abusive language. Return ONLY the word \"VIOLATION\" if it is highly toxic, abusive, or spam. Return \"SAFE\" if it is acceptable (even if it describes corruption, as long as it's not abusive). Text: ${text}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim().toUpperCase().includes("VIOLATION");
  } catch (error) {
    console.error("Toxicity check failed:", error);
    return false;
  }
}

export type UsefulnessAssessment = {
  score: number;
  reason: string;
};

export async function assessUsefulness(text: string): Promise<UsefulnessAssessment | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!text || text.trim().length === 0) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Rate this corruption report from 0-10 for usefulness. 0 = gibberish, spam, or completely off-topic. 10 = specific, credible, actionable detail about a bribery demand. Return ONLY JSON: { "score": <0-10>, "reason": "<one sentence>" }\n\nText: ${text}`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const match = raw.match(/\{[\s\S]*\}/);
    const jsonText = match ? match[0] : raw;
    const parsed = JSON.parse(jsonText) as { score?: number; reason?: string };
    const score = typeof parsed.score === "number" ? Math.max(0, Math.min(10, parsed.score)) : 0;
    const reason = typeof parsed.reason === "string" ? parsed.reason : "no reason provided";
    return { score, reason };
  } catch (error) {
    console.error("Usefulness check failed:", error);
    return null;
  }
}

export async function sanitizeSubmission(rawNarrative: string): Promise<string | null> {
  // Step 1: Regex Redaction for Malaysian context (phones, ICs, plates)
  let cleanText = rawNarrative
    .replace(/(?:\+?60|0)[1-9]\d{7,9}/g, "[PHONE REDACTED]")
    .replace(/\b\d{6}-\d{2}-\d{4}\b/g, "[IC REDACTED]")
    .replace(/\b\d{12}\b/g, "[IC REDACTED]")
    .replace(/\b[A-Z]{1,3}\s*\d{1,4}\s*[A-Z]{0,1}\b/gi, "[PLATE REDACTED]");

  // Step 2: Named Entity Recognition (LLM or fallback)
  cleanText = await removePersonNamesViaLLM(cleanText);

  // Step 3: Toxicity & Hate Speech Check
  const isViolating = await checkToxicityAndSpam(cleanText);
  if (isViolating) return null;

  // Step 4: Usefulness / Quality Gate
  const assessment = await assessUsefulness(cleanText);
  if (assessment && assessment.score < 4) {
    console.warn("Submission blocked by usefulness filter:", assessment.reason);
    return null;
  }

  return cleanText;
}
