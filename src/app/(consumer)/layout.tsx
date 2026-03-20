import ConsumerNav from "@/components/layout/ConsumerNav";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <ConsumerNav />
      <main className="pt-14 md:pt-16">
        {children}
      </main>
    </div>
  );
}
