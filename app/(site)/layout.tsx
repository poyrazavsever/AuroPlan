import Navbar from "@/components/ui/Navbar"; // Navbar import edildi
import Footer from "@/components/ui/Footer"; // Footer import edildi

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20">{children}</main>

      <Footer />
    </div>
  );
}
