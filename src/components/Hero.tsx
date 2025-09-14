import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReportModal } from "./ReportModal";
import heroImage from "@/assets/hero-cityscape.jpg";

export const Hero = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <>
      <section 
        className="relative text-white pt-32 pb-20 min-h-screen flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in">
            Improve Your Community,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              One Report at a Time
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto mb-8 animate-slide-up">
            See a pothole, a broken streetlight, or an overflowing bin? Report it in seconds with CivicLink and help make your city a better place.
          </p>
          <Button
            onClick={() => setIsReportModalOpen(true)}
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-smooth transform hover:scale-105 animate-bounce-in"
          >
            Submit a Report Now
          </Button>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};