"use client";

import { useState } from "react";
import type { MndaData } from "@/nda/types";

/**
 * Generates the MNDA PDF entirely in the browser on click, then triggers a
 * download. `@react-pdf/renderer` and the document component are imported
 * lazily so they never run during server-side rendering.
 */
export default function DownloadPdfButton({ data }: { data: MndaData }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const [{ pdf }, { NdaPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./NdaPdfDocument"),
      ]);
      const blob = await pdf(<NdaPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mutual-nda.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? "Preparing PDF…" : "Download PDF"}
    </button>
  );
}
