import * as mammoth from "mammoth";

function normalizeText(value: string) {
  return value.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
}

export async function extractBrowserDocument(filename: string, arrayBuffer: ArrayBuffer): Promise<{ text: string; wordCount: number }> {
  if (filename.split(".").pop()?.toLowerCase() !== "docx") throw new Error("The static web version reads DOCX files locally. For PDF submissions, paste the essay text instead.");
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = normalizeText(result.value);
  if (!text) throw new Error("No readable text was found. For this document, paste the essay text instead.");
  return { text, wordCount: text.match(/\S+/g)?.length ?? 0 };
}
