import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <Sidebar />

      <main className="min-h-screen bg-white pt-16 lg:pl-64">
        {children}
      </main>

      <MobileBottomNav />
    </>
  );
}