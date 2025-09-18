export const metadata = { title: "Apocalypse Bunker Queue" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head />
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 12 }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>{children}</div>
      </body>
    </html>
  );
}
