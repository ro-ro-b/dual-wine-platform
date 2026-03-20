import ConsumerNav from "@/components/layout/ConsumerNav";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-light">
      <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto pb-24">
        {children}
      </main>
      <ConsumerNav />
    </div>
  );
}
