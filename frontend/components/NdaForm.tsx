"use client";

import type { MndaData, Party } from "@/nda/types";

interface NdaFormProps {
  data: MndaData;
  onChange: (data: MndaData) => void;
}

const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm " +
  "focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";
const sectionClass = "space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm";
const legendClass = "text-base font-semibold text-slate-900";

export default function NdaForm({ data, onChange }: NdaFormProps) {
  const set = <K extends keyof MndaData>(key: K, value: MndaData[K]) =>
    onChange({ ...data, [key]: value });

  const setParty = (which: "party1" | "party2", patch: Partial<Party>) =>
    onChange({ ...data, [which]: { ...data[which], ...patch } });

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Agreement terms */}
      <fieldset className={sectionClass}>
        <legend className={legendClass}>Agreement terms</legend>

        <div>
          <label className={labelClass} htmlFor="purpose">
            Purpose
          </label>
          <textarea
            id="purpose"
            className={inputClass}
            rows={2}
            value={data.purpose}
            onChange={(e) => set("purpose", e.target.value)}
            placeholder="How Confidential Information may be used"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="effectiveDate">
            Effective date
          </label>
          <input
            id="effectiveDate"
            type="date"
            className={inputClass}
            value={data.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
          />
        </div>

        {/* MNDA Term */}
        <div className="space-y-2">
          <span className={labelClass}>MNDA term</span>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="mndaTermMode"
              checked={data.mndaTermMode === "expires"}
              onChange={() => set("mndaTermMode", "expires")}
            />
            <span>Expires</span>
            <input
              type="number"
              min={1}
              aria-label="MNDA term length in years"
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-100"
              value={data.mndaTermYears}
              disabled={data.mndaTermMode !== "expires"}
              onChange={(e) =>
                set("mndaTermYears", Math.max(1, Number(e.target.value) || 1))
              }
            />
            <span>year(s) from the effective date</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="mndaTermMode"
              checked={data.mndaTermMode === "untilTerminated"}
              onChange={() => set("mndaTermMode", "untilTerminated")}
            />
            <span>Continues until terminated</span>
          </label>
        </div>

        {/* Term of Confidentiality */}
        <div className="space-y-2">
          <span className={labelClass}>Term of confidentiality</span>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="confidentialityMode"
              checked={data.confidentialityMode === "years"}
              onChange={() => set("confidentialityMode", "years")}
            />
            <input
              type="number"
              min={1}
              aria-label="Term of confidentiality length in years"
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-100"
              value={data.confidentialityYears}
              disabled={data.confidentialityMode !== "years"}
              onChange={(e) =>
                set(
                  "confidentialityYears",
                  Math.max(1, Number(e.target.value) || 1),
                )
              }
            />
            <span>year(s) from the effective date</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="confidentialityMode"
              checked={data.confidentialityMode === "perpetuity"}
              onChange={() => set("confidentialityMode", "perpetuity")}
            />
            <span>In perpetuity</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="governingLaw">
              Governing law (state)
            </label>
            <input
              id="governingLaw"
              className={inputClass}
              value={data.governingLaw}
              onChange={(e) => set("governingLaw", e.target.value)}
              placeholder="Delaware"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="jurisdiction">
              Jurisdiction
            </label>
            <input
              id="jurisdiction"
              className={inputClass}
              value={data.jurisdiction}
              onChange={(e) => set("jurisdiction", e.target.value)}
              placeholder="New Castle, DE"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="modifications">
            Modifications to the Standard Terms{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="modifications"
            className={inputClass}
            rows={2}
            value={data.modifications}
            onChange={(e) => set("modifications", e.target.value)}
            placeholder="List any modifications to the MNDA"
          />
        </div>
      </fieldset>

      {/* Parties */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PartyFields
          title="Party 1"
          idPrefix="party1"
          party={data.party1}
          onChange={(patch) => setParty("party1", patch)}
        />
        <PartyFields
          title="Party 2"
          idPrefix="party2"
          party={data.party2}
          onChange={(patch) => setParty("party2", patch)}
        />
      </div>
    </form>
  );
}

function PartyFields({
  title,
  idPrefix,
  party,
  onChange,
}: {
  title: string;
  idPrefix: string;
  party: Party;
  onChange: (patch: Partial<Party>) => void;
}) {
  return (
    <fieldset className={sectionClass}>
      <legend className={legendClass}>{title}</legend>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-company`}>
          Company
        </label>
        <input
          id={`${idPrefix}-company`}
          className={inputClass}
          value={party.company}
          onChange={(e) => onChange({ company: e.target.value })}
          placeholder="Acme, Inc."
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-name`}>
          Print name
        </label>
        <input
          id={`${idPrefix}-name`}
          className={inputClass}
          value={party.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-title`}>
          Title
        </label>
        <input
          id={`${idPrefix}-title`}
          className={inputClass}
          value={party.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Chief Executive Officer"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-notice`}>
          Notice address{" "}
          <span className="font-normal text-slate-400">(email or postal)</span>
        </label>
        <input
          id={`${idPrefix}-notice`}
          className={inputClass}
          value={party.noticeAddress}
          onChange={(e) => onChange({ noticeAddress: e.target.value })}
          placeholder="legal@acme.com"
        />
      </div>
    </fieldset>
  );
}
