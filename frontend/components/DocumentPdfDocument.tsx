import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { DocumentData, PartyBlock } from "@/nda/types";
import { getDocumentType, type DocumentType } from "@/nda/registry";
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
  signatureArea: { flexDirection: "row", gap: 24, marginTop: 14 },
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
  termBlock: { marginTop: 3 },
  attribution: { marginTop: 18, fontSize: 8, color: "#64748b" },
});

/** The downloadable document as a react-pdf document. */
export function DocumentPdfDocument({ data }: { data: DocumentData }) {
  const doc = getDocumentType(data.docType);
  if (!doc) return <EmptyDoc />;

  const fields = coverFields(data);

  return (
    <Document title={doc.name}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{doc.name}</Text>

        {fields.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Key Terms</Text>
            {fields.map((field) => (
              <CoverRow key={field.label} label={field.label} value={field.value} />
            ))}
          </>
        )}

        {data.parties.length > 0 && (
          <View style={styles.signatureArea}>
            {data.parties.map((party, i) => (
              <SignatureBlock key={i} party={party} />
            ))}
          </View>
        )}

        <Text style={styles.termsTitle}>Standard Terms</Text>
        {doc.terms.map((section) => (
          <Term key={section.n} section={section} />
        ))}

        <Text style={styles.attribution}>{doc.attribution}</Text>
      </Page>
    </Document>
  );
}

function EmptyDoc() {
  return (
    <Document title="Document">
      <Page size="LETTER" style={styles.page}>
        <Text>No document selected.</Text>
      </Page>
    </Document>
  );
}

function Term({ section }: { section: DocumentType["terms"][number] }) {
  return (
    <View style={styles.term}>
      <Text>
        <Text style={styles.termHeading}>
          {section.n}. {section.heading}.
        </Text>{" "}
        {section.blocks[0]}
      </Text>
      {section.blocks.slice(1).map((block, i) => (
        <Text key={i} style={styles.termBlock}>
          {block}
        </Text>
      ))}
    </View>
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

function SignatureBlock({ party }: { party: PartyBlock }) {
  return (
    <View style={styles.signatureBlock}>
      <Text style={styles.signatureHeading}>{party.heading || "Party"}</Text>
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
