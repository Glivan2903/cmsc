import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata = {
  title: "Centro Médico Siqueira Campos",
  description: "Centro médico em Aracaju com diversas especialidades e agendamento online.",
  keywords: ["Centro Médico", "Saúde", "Aracaju", "Agendamento Médico", "Siqueira Campos"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
