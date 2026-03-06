import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokémon Team Generator",
  description: "Generate a random team of 6 Pokémon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
