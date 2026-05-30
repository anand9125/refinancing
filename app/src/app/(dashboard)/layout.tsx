import { AppHeader } from "@/components/zenith/AppHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#05070a" }}>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
