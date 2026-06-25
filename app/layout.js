import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "VGC Meta Browser | Poketrainers",
  description: "Un browser metagame minimal, premium e funzionale per i regolamenti in atto del competitivo di Pokémon Champions VGC. Analizza Pokémon, mosse, strumenti, nature e team.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <header className="navbar">
          <div className="container navbar-inner">
            <a href="/" className="logo-area">
              <span className="logo-text">PokeTrainers Champions</span>
              <span className="badge-vgc">VGC Meta</span>
            </a>
            <nav className="nav-links">
              <a href="/" className="nav-item">Dashboard</a>
            </nav>
          </div>
        </header>

        <main className="main-content container animate-fade-in">
          {children}
        </main>

        <footer className="footer">
          <div className="container">
            <p style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.75rem' }}>
              Dati in tempo reale estratti da Pikalytics e integrati con PokeAPI v2.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
