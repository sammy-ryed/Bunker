import "./globals.css";

export const metadata = {
  title: "Apocalypse Bunker Queue",
  description: "Survive if you can...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bunker-bg text-gray-200 flex justify-center">
        <div className="w-full max-w-md p-4">{children}</div>
      </body>
    </html>
  );
}
