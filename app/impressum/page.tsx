import Link from "next/link"

export const metadata = { title: "Impressum – Blore Barber" }

export default function ImpressumPage() {
  return (
    <div style={page}>
      <div style={card}>
        <Link href="/" style={back}>
          ← Ana sayfaya dön
        </Link>

        <h1 style={{ marginTop: 0 }}>Impressum</h1>

        <h2 style={h2}>Medieninhaber und Betreiber</h2>
        <p>
          Betül Erol (Blore Barber)
          <br />
          Voltagasse 55/2/9
          <br />
          1210 Wien, Österreich
        </p>

        <h2 style={h2}>Kontakt</h2>
        <p>E-Mail: be.tul54@hotmail.com</p>

        <h2 style={h2}>Unternehmensgegenstand</h2>
        <p>Friseur (Barbershop)</p>

        <h2 style={h2}>Gewerbebehörde</h2>
        <p>Magistratisches Bezirksamt Wien</p>

        <h2 style={h2}>Kammerzugehörigkeit</h2>
        <p>Wirtschaftskammer Wien</p>

        <h2 style={h2}>Anwendbare Rechtsvorschriften</h2>
        <p>
          Gewerbeordnung, abrufbar unter{" "}
          <a href="https://www.ris.bka.gv.at" style={{ color: "#2563eb" }}>
            www.ris.bka.gv.at
          </a>
        </p>

        <h2 style={h2}>Grundlegende Richtung</h2>
        <p>
          Information über das Angebot von Blore Barber und Online-Terminbuchung.
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
