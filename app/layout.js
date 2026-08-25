import "./globals.css";

export const metadata = {
  title: "My Todo App",
  description: "A beginner-friendly React Todo application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
