import Link from "next/link"

export const metadata = { title: "Datenschutzerklärung – Blore Barber" }

export default function DatenschutzPage() {
  return (
    <div style={page}>
      <div style={card}>
        <Link href="/" style={back}>
          ← Ana sayfaya dön
        </Link>

        <h1 style={{ marginTop: 0 }}>Datenschutzerklärung</h1>

        <h2 style={h2}>1. Verantwortliche</h2>
        <p>
          Betül Erol (Blore Barber)
          <br />
          Voltagasse 55/2/9, 1210 Wien, Österreich
          <br />
          E-Mail: be.tul54@hotmail.com
        </p>

        <h2 style={h2}>2. Welche Daten wir verarbeiten</h2>
        <p>
          Bei einer Online-Terminbuchung verarbeiten wir: Name, Telefonnummer,
          gewählte Leistung, gewählte Mitarbeiterin bzw. gewählten Mitarbeiter,
          Datum und Uhrzeit des Termins sowie eine optionale Notiz. Beim Aufruf
          der Website verarbeitet unser Hosting-Anbieter technisch notwendige
          Daten (z. B. IP-Adresse, Zeitpunkt des Zugriffs) in Server-Protokollen.
        </p>

        <h2 style={h2}>3. Zweck und Rechtsgrundlage</h2>
        <p>
          Wir verarbeiten Ihre Daten, um Termine zu vereinbaren, zu verwalten
          und zu stornieren sowie um Sie bei Rückfragen zum Termin zu
          kontaktieren (Art. 6 Abs. 1 lit. b DSGVO). Der sichere Betrieb der
          Website beruht auf unserem berechtigten Interesse (Art. 6 Abs. 1
          lit. f DSGVO). Name und Telefonnummer sind für die Buchung
          erforderlich; ohne diese Angaben kann kein Termin gebucht werden.
        </p>

        <h2 style={h2}>4. Speicherdauer</h2>
        <p>
          Termindaten werden gelöscht, sobald sie für den genannten Zweck nicht
          mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten
          entgegenstehen. Sie können jederzeit die Löschung Ihrer Daten
          verlangen.
        </p>

        <h2 style={h2}>5. Empfänger und Auftragsverarbeiter</h2>
        <p>
          Für den Betrieb dieser Website nutzen wir folgende Dienstleister:
          Vercel Inc. (Hosting) und Google Ireland Limited bzw. Google LLC
          (Firebase: Datenbank und Authentifizierung). Mit diesen Dienstleistern
          bestehen Auftragsverarbeitungsvereinbarungen. Soweit Daten in die USA
          übermittelt werden, erfolgt dies auf Grundlage des EU-U.S. Data
          Privacy Framework bzw. von EU-Standardvertragsklauseln. Eine
          Weitergabe an sonstige Dritte erfolgt nicht.
        </p>

        <h2 style={h2}>6. Cookies und lokale Speicherung</h2>
        <p>
          Wir setzen keine Tracking- oder Analyse-Cookies ein. Während der
          Buchung werden Ihre Eingaben vorübergehend im lokalen Speicher Ihres
          Browsers abgelegt, damit der Buchungsvorgang fortgesetzt werden kann.
          Dies ist technisch erforderlich.
        </p>

        <h2 style={h2}>7. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
          (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
          (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21).
          Bitte wenden Sie sich dazu an be.tul54@hotmail.com. Sie haben außerdem
          das Recht, sich bei der Datenschutzbehörde zu beschweren:
          Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Wien,{" "}
          <a href="https://www.dsb.gv.at" style={{ color: "#2563eb" }}>
            www.dsb.gv.at
          </a>
          .
        </p>

        <p style={{ color: "#64748b", marginTop: 28, fontSize: 14 }}>
          Stand: Oktober 2026
        </p>
      </div>
    </div>
  )
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
  padding: 20,
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",
}

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  alignSelf: "flex-start",
  background: "white",
  color: "#111827",
  borderRadius: 24,
  padding: "28px 24px",
  boxSizing: "border-box",
  lineHeight: 1.6,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
}

const back: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 16,
  color: "#2563eb",
  fontWeight: 700,
  textDecoration: "none",
}

const h2: React.CSSProperties = {
  fontSize: 18,
  marginTop: 24,
  marginBottom: 6,
}
