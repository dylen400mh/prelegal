"use client";

import type { DocumentData, PartyBlock } from "@/nda/types";
import { getDocumentType } from "@/nda/registry";
import { coverFields, signatureRows } from "@/nda/format";

/**
 * On-screen rendering of the assembled document. It reads its cover fields and
 * signature rows from the same helpers the PDF uses, and its title/terms from
 * the registry, so the preview matches the download.
 */
export default function DocumentPreview({ data }: { data: DocumentData }) {
  const doc = getDocumentType(data.docType);

  if (!doc) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center p-10 text-center text-sm text-slate-400">
        Your document will appear here once you tell the assistant what you need.
      </div>
    );
  }

  const fields = coverFields(data);

  return (
    <article className="mx-auto max-w-[8.5in] bg-white p-10 text-[13px] leading-relaxed text-slate-800 shadow-sm">
      <h1 className="text-center text-xl font-bold uppercase tracking-wide">
        {doc.name}
      </h1>

      {fields.length > 0 && (
        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Key Terms
          </h2>
          {fields.map((field) => (
            <div key={field.label} className="grid grid-cols-[160px_1fr] gap-3">
              <span className="font-semibold">{field.label}</span>
              <span className="whitespace-pre-wrap">{field.value}</span>
            </div>
          ))}
        </section>
      )}

      {data.parties.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-6">
          {data.parties.map((party, i) => (
            <SignatureBlock key={i} party={party} />
          ))}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-center text-base font-bold uppercase tracking-wide">
          Standard Terms
        </h2>
        <ol className="mt-4 space-y-3">
          {doc.terms.map((section) => (
            <li key={section.n} className="text-justify">
              <span className="font-bold">
                {section.n}. {section.heading}.
              </span>{" "}
              {section.blocks[0]}
              {section.blocks.slice(1).map((block, i) => (
                <span key={i} className="mt-1 block whitespace-pre-wrap">
                  {block}
                </span>
              ))}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[11px] text-slate-500">{doc.attribution}</p>
      </section>
    </article>
  );
}

function SignatureBlock({ party }: { party: PartyBlock }) {
  return (
    <div className="space-y-2 text-[12px]">
      <p className="font-bold">{party.heading || "Party"}</p>
      {signatureRows(party).map((row) => (
        <div key={row.label}>
          <span className="text-slate-500">{row.label}:</span>{" "}
          <span className="inline-block min-w-[10rem] border-b border-slate-400 align-baseline">
            {row.value || " "}
          </span>
        </div>
      ))}
    </div>
  );
}
