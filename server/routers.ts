import { z } from "zod";
import * as mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const MAX_DOCUMENT_BYTES = 5_000_000;

function normalizeExtractedText(text: string) {
  return text.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
}

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

async function extractDocumentText(filename: string, bytes: Uint8Array): Promise<string> {
  const extension = getExtension(filename);
  if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return normalizeExtractedText(result.value);
  }
  if (extension === "pdf") {
    const parser = new PDFParse({ data: bytes });
    try {
      const result = await parser.getText();
      return normalizeExtractedText(result.text);
    } finally {
      await parser.destroy();
    }
  }
  throw new Error("Only PDF and DOCX documents are supported.");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  documents: router({
    extract: publicProcedure
      .input(z.object({ filename: z.string().min(1).max(255), mimeType: z.string().max(160), base64: z.string().min(1).max(7_000_000) }))
      .mutation(async ({ input }) => {
        const extension = getExtension(input.filename);
        if (extension !== "pdf" && extension !== "docx") throw new Error("Choose a PDF or DOCX document.");
        const bytes = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
        if (!bytes.length || bytes.length > MAX_DOCUMENT_BYTES) throw new Error("Choose a valid document smaller than 5 MB.");
        const text = await extractDocumentText(input.filename, bytes);
        if (!text) throw new Error("No readable text was found. For scan-only or protected files, paste the essay text instead.");
        const wordCount = text.match(/\S+/g)?.length ?? 0;
        return { text, wordCount };
      }),
  }),
});

export type AppRouter = typeof appRouter;
