import ConsumerNav from "@/components/layout/ConsumerNav";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <ConsumerNav />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
