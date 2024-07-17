import { Poppins } from "next/font/google";
import "./globals.css";
 
// If loading a variable font, you don't need to specify the font weight
const poppins= Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})


export const metadata = {
  title: "Pokè Trainers",
  description: "Web app for real PokèTrainers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
