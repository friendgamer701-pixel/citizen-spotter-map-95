import { Card } from "@/components/ui/card";
import { MapPin, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LiveMap = () => {
  return (
    <section id="live-map" className="py-20 bg-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Live City-Wide Issue Map
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See real-time reports from across your community. Filter by category to see what matters to you.
          </p>
        </div>

        {/* Map Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            All Categories
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-department-public-works rounded-full"></div>
            Potholes
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-department-utilities rounded-full"></div>
            Streetlights
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-department-sanitation rounded-full"></div>
            Waste Management
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-department-parks rounded-full"></div>
            Parks & Recreation
          </Button>
        </div>

        {/* Map Container */}
        <Card className="overflow-hidden shadow-xl border-4 border-white/50 animate-fade-in">
          <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-96 md:h-[500px] lg:h-[600px] flex items-center justify-center">
            {/* Placeholder Map Content */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <MapPin className="w-16 h-16 text-primary animate-bounce" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-600">Interactive Map Coming Soon</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                This will display a real-time map of all reported issues across your city, with interactive filtering and detailed issue information.
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  Active Reports
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  Resolved Issues
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                  In Progress
                </div>
              </div>
            </div>

            {/* Decorative map pins */}
            <div className="absolute top-20 left-20 w-4 h-4 bg-primary rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-32 right-24 w-3 h-3 bg-accent rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-24 left-32 w-5 h-5 bg-warning rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 right-20 w-3 h-3 bg-success rounded-full animate-ping opacity-75" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </Card>

        {/* Map Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card className="text-center p-6 shadow-md hover:shadow-lg transition-smooth">
            <div className="text-2xl font-bold text-primary mb-2">247</div>
            <div className="text-sm text-muted-foreground">Active Reports</div>
          </Card>
          <Card className="text-center p-6 shadow-md hover:shadow-lg transition-smooth">
            <div className="text-2xl font-bold text-accent mb-2">1,834</div>
            <div className="text-sm text-muted-foreground">Resolved Issues</div>
          </Card>
          <Card className="text-center p-6 shadow-md hover:shadow-lg transition-smooth">
            <div className="text-2xl font-bold text-warning mb-2">73</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </Card>
          <Card className="text-center p-6 shadow-md hover:shadow-lg transition-smooth">
            <div className="text-2xl font-bold text-success mb-2">4.2</div>
            <div className="text-sm text-muted-foreground">Avg Response Days</div>
          </Card>
        </div>
      </div>
    </section>
  );
};