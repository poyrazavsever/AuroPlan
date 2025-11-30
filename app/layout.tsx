import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auro Plan - Your Personal Task Manager and Work Organizer",
  description: "Auro Plan helps you manage tasks, organize work, and boost productivity with an intuitive interface and powerful features. Stay on top of your projects and deadlines effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
