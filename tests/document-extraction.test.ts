import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

async function buildMinimalDocx(text: string) {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`,
  );
  return zip.generateAsync({ type: "base64" });
}

function createPublicContext() {
  return {
    user: null,
    req: { protocol: "https", headers: {} },
    res: { clearCookie: () => undefined },
  } as unknown as TrpcContext;
}

describe("transient document extraction", () => {
  it("extracts DOCX body text without storing the source document", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const base64 = await buildMinimalDocx("This DOCX sentence should be extracted for a deterministic review.");
    const result = await caller.documents.extract({
      filename: "student-draft.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      base64,
    });

    expect(result.text).toContain("DOCX sentence should be extracted");
    expect(result.wordCount).toBeGreaterThan(5);
  });
});
