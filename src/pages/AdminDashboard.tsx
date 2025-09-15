import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }
        setReports(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleStatusChange = async (reportId: number, newStatus: string) => {
    const originalReports = [...reports];
    const newReports = reports.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    );

    setReports(newReports);

    try {
      const { data, error } = await supabase
        .from("issues")
        .update({ status: newStatus })
        .eq("id", reportId)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        console.error("Supabase update did not return data. RLS policy might be blocking the update.");
        throw new Error("Failed to update report in the database. Please check your permissions.");
      }

      toast.success("Report status updated successfully");

    } catch (error: any) {
      setReports(originalReports);
      toast.error("Failed to update report status", {
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Admin Dashboard</h1>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="shadow-lg">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg font-semibold">Failed to load reports: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  {report.image_url && (
                    <div className="w-full h-48 overflow-hidden">
                      <img src={report.image_url} alt={report.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-gray-800 truncate">{report.title}</CardTitle>
                    <p className="text-sm text-gray-500 pt-1">{new Date(report.created_at).toLocaleString()}</p>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-gray-600 mb-4">{report.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{report.category}</Badge>
                        <Badge variant={report.status === 'resolved' ? 'success' : 'outline'}>{report.status}</Badge>
                      </div>
                      {report.location_name && <p className="text-sm text-gray-500"><span className="font-semibold">Location:</span> {report.location_name}</p>}
                      {report.street_address && <p className="text-sm text-gray-500"><span className="font-semibold">Street Address:</span> {report.street_address}</p>}
                      {report.landmark && <p className="text-sm text-gray-500"><span className="font-semibold">Landmark:</span> {report.landmark}</p>}
                    </div>
                    <div className="mt-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">Change Status</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'pending')}>Pending</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'in-progress')}>In Progress</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'resolved')}>Resolved</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reports have been submitted yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
