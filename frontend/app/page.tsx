"use client";

import { useState } from "react";
import DocumentChat from "@/components/DocumentChat";
import DocumentPreview from "@/components/DocumentPreview";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import { EMPTY_DOCUMENT, type DocumentData } from "@/nda/types";

export default function Home() {
  const [data, setData] = useState<DocumentData>(EMPTY_DOCUMENT);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Legal Document Creator
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Chat with an AI to build a Common Paper legal document, then download
          it as a PDF.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: chat */}
        <div>
          <DocumentChat data={data} onChange={setData} />
        </div>

        {/* Right: live preview + download */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Preview
            </h2>
            <DownloadPdfButton data={data} />
          </div>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
            <DocumentPreview data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
