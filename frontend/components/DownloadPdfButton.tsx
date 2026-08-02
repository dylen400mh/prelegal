"use client";

import { useState } from "react";
import type { DocumentData } from "@/nda/types";
import { getDocumentType } from "@/nda/registry";

/**
 * Generates the document PDF entirely in the browser on click, then triggers a
 * download. `@react-pdf/renderer` and the document component are imported
 * lazily so they never run during server-side rendering.
 */
export default function DownloadPdfButton({ data }: { data: DocumentData }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = getDocumentType(data.docType) !== undefined;

  const handleDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      const [{ pdf }, { DocumentPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./DocumentPdfDocument"),
      ]);
      const blob = await pdf(<DocumentPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.docType || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate the PDF", err);
      setError("Sorry — the PDF couldn't be generated. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy || !ready}
        className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Preparing PDF…" : "Download PDF"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
