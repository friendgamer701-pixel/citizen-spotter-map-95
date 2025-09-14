import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { LiveMap } from "@/components/LiveMap";
import { AppDownload } from "@/components/AppDownload";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <LiveMap />
        <AppDownload />
      </main>
    </div>
  );
};

export default Index;
