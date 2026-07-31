"use client";

import type { MndaData, Party } from "@/nda/types";
import { STANDARD_TERMS, STANDARD_TERMS_ATTRIBUTION } from "@/nda/terms";
import {
  confidentialityText,
  formatEffectiveDate,
  governingLawText,
  jurisdictionText,
  mndaTermText,
  modificationsText,
  purposeText,
} from "@/nda/format";

/**
 * On-screen rendering of the assembled MNDA. Mirrors the layout produced by the
 * PDF document so the preview matches the download.
 */
export default function NdaPreview({ data }: { data: MndaData }) {
  return (
    <article className="mx-auto max-w-[8.5in] bg-white p-10 text-[13px] leading-relaxed text-slate-800 shadow-sm">
      <h1 className="text-center text-xl font-bold uppercase tracking-wide">
        Mutual Non-Disclosure Agreement
      </h1>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Cover Page
        </h2>
        <CoverField label="Purpose" value={purposeText(data)} />
        <CoverField
          label="Effective Date"
          value={formatEffectiveDate(data.effectiveDate)}
        />
        <CoverField label="MNDA Term" value={mndaTermText(data)} />
        <CoverField
          label="Term of Confidentiality"
          value={confidentialityText(data)}
        />
        <CoverField label="Governing Law" value={governingLawText(data)} />
        <CoverField label="Jurisdiction" value={jurisdictionText(data)} />
        <CoverField label="Modifications" value={modificationsText(data)} />
      </section>

      <p className="mt-6 text-[13px]">
        By signing this Cover Page, each party agrees to enter into this MNDA as
        of the Effective Date.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-6">
        <SignatureBlock heading="Party 1" party={data.party1} />
        <SignatureBlock heading="Party 2" party={data.party2} />
      </div>

      <section className="mt-10">
        <h2 className="text-center text-base font-bold uppercase tracking-wide">
          Standard Terms
        </h2>
        <ol className="mt-4 space-y-3">
          {STANDARD_TERMS.map((section) => (
            <li key={section.n} className="text-justify">
              <span className="font-bold">
                {section.n}. {section.heading}.
              </span>{" "}
              {section.text}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[11px] text-slate-500">
          {STANDARD_TERMS_ATTRIBUTION}
        </p>
      </section>
    </article>
  );
}

function CoverField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3">
      <span className="font-semibold">{label}</span>
      <span className="whitespace-pre-wrap">{value}</span>
    </div>
  );
}

function SignatureBlock({
  heading,
  party,
}: {
  heading: string;
  party: Party;
}) {
  return (
    <div className="space-y-2 text-[12px]">
      <p className="font-bold">{heading}</p>
      <SignatureRow label="Signature" value="" />
      <SignatureRow label="Print Name" value={party.name} />
      <SignatureRow label="Title" value={party.title} />
      <SignatureRow label="Company" value={party.company} />
      <SignatureRow label="Notice Address" value={party.noticeAddress} />
      <SignatureRow label="Date" value="" />
    </div>
  );
}

function SignatureRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-500">{label}:</span>{" "}
      <span className="border-b border-slate-400">
        {value || " ".repeat(20)}
      </span>
    </div>
  );
}
