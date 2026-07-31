import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { MndaData, Party } from "@/nda/types";
import { STANDARD_TERMS, STANDARD_TERMS_ATTRIBUTION } from "@/nda/terms";
import { coverFields, signatureRows } from "@/nda/format";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 54,
    fontFamily: "Times-Roman",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#1e293b",
  },
  title: {
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 8,
  },
  coverRow: { flexDirection: "row", marginBottom: 6 },
  coverLabel: { width: 130, fontFamily: "Times-Bold" },
  coverValue: { flex: 1 },
  intro: { marginTop: 14, marginBottom: 10 },
  signatureArea: { flexDirection: "row", gap: 24 },
  signatureBlock: { flex: 1 },
  signatureHeading: { fontFamily: "Times-Bold", marginBottom: 6 },
  signatureRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginBottom: 8,
    paddingBottom: 2,
    minHeight: 14,
  },
  signatureRowLabel: { color: "#64748b", fontSize: 8 },
  termsTitle: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 12,
  },
  term: { marginBottom: 8, textAlign: "justify" },
  termHeading: { fontFamily: "Times-Bold" },
  attribution: { marginTop: 18, fontSize: 8, color: "#64748b" },
});

/** The downloadable MNDA as a react-pdf document. */
export function NdaPdfDocument({ data }: { data: MndaData }) {
  return (
    <Document title="Mutual Non-Disclosure Agreement">
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>

        <Text style={styles.sectionLabel}>Cover Page</Text>
        {coverFields(data).map((field) => (
          <CoverRow key={field.label} label={field.label} value={field.value} />
        ))}

        <Text style={styles.intro}>
          By signing this Cover Page, each party agrees to enter into this MNDA
          as of the Effective Date.
        </Text>

        <View style={styles.signatureArea}>
          <SignatureBlock heading="Party 1" party={data.party1} />
          <SignatureBlock heading="Party 2" party={data.party2} />
        </View>

        <Text style={styles.termsTitle}>Standard Terms</Text>
        {STANDARD_TERMS.map((section) => (
          <Text key={section.n} style={styles.term}>
            <Text style={styles.termHeading}>
              {section.n}. {section.heading}.
            </Text>{" "}
            {section.text}
          </Text>
        ))}

        <Text style={styles.attribution}>{STANDARD_TERMS_ATTRIBUTION}</Text>
      </Page>
    </Document>
  );
}

function CoverRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.coverRow}>
      <Text style={styles.coverLabel}>{label}</Text>
      <Text style={styles.coverValue}>{value}</Text>
    </View>
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
    <View style={styles.signatureBlock}>
      <Text style={styles.signatureHeading}>{heading}</Text>
      {signatureRows(party).map((row) => (
        <SignatureRow key={row.label} label={row.label} value={row.value} />
      ))}
    </View>
  );
}

function SignatureRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.signatureRow}>
      <Text style={styles.signatureRowLabel}>{label}</Text>
      <Text>{value || " "}</Text>
    </View>
  );
}
