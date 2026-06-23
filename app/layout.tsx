import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Modern Task Flow",
  description: "Next.js + TS + React Query Tasks App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}