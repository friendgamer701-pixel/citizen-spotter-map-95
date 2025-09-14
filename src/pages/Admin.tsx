import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  BarChart2,
  ListChecks,
  Users,
  Archive,
  AlertTriangle,
  CheckCircle2,
  List,
  LogOut,
  Image,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  location_name: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { toast } = useToast();

  // Fetch issues from Supabase
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching issues:', error);
        toast({
          title: "Error",
          description: "Failed to fetch issues from database.",
          variant: "destructive",
        });
        return;
      }

      setIssues(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    issueId: number,
    newStatus: string,
  ) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .eq('id', issueId);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update issue status.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setIssues(
        issues.map((issue) =>
          issue.id === issueId ? { ...issue, status: newStatus } : issue,
        ),
      );

      toast({
        title: "Status Updated",
        description: "Issue status has been updated successfully.",
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const totalIssues = issues.length;
  const newIssues = issues.filter((i) => i.status === "new").length;
  const inProgressIssues = issues.filter((i) => i.status === "in_progress").length;
  const resolvedIssues = issues.filter((i) => i.status === "resolved").length;

  const categoryData = Object.entries(
    issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#3b82f6", "#f97316", "#10b981", "#ef4444", "#8b5cf6"];

  const getStatusBadgeVariant = (status: string) => {
    if (status === "new") return "destructive";
    if (status === "in_progress") return "default";
    if (status === "resolved") return "secondary";
    return "outline";
  };

  const getStatusIcon = (status: string) => {
    if (status === "new") return <AlertTriangle className="h-4 w-4" />;
    if (status === "in_progress") return <ListChecks className="h-4 w-4" />;
    if (status === "resolved") return <CheckCircle2 className="h-4 w-4" />;
    return null;
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this dashboard.</p>
          <Button onClick={() => navigate('/auth')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full bg-muted/40">
        <aside className="hidden w-60 flex-col border-r bg-background p-4 sm:flex">
          <div className="mb-8 flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">CivicLink Admin</h2>
          </div>
          <nav className="flex flex-col gap-2">
            <Button variant="secondary" className="justify-start gap-2">
              <List className="h-4 w-4" />
              <span>All Issues ({totalIssues})</span>
            </Button>
          </nav>
          <div className="mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-muted-foreground" 
              onClick={() => setIsLogoutAlertOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </Button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage and track all reported issues</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalIssues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{newIssues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <ListChecks className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{inProgressIssues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{resolvedIssues}</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution Chart */}
          {categoryData.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Distribution of reported issues by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Issues Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Issues</CardTitle>
              <CardDescription>Complete list of reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {issue.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{issue.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(issue.status)} className="gap-1">
                          {getStatusIcon(issue.status)}
                          {issue.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">
                            {issue.location_name || `${issue.latitude}, ${issue.longitude}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {issue.image_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedImage(issue.image_url)}
                            className="h-8 w-8 p-0"
                          >
                            <Image className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">No image</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(issue.id, "new")}
                                >
                                  Mark as New
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(issue.id, "in_progress")}
                                >
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(issue.id, "resolved")}
                                >
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => window.open(`https://maps.google.com/?q=${issue.latitude},${issue.longitude}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on Map
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {issues.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No issues reported yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Issue Image</DialogTitle>
            <DialogDescription>
              Uploaded image for this issue report
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Issue"
                className="max-w-full max-h-[400px] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation */}
      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be returned to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminDashboard;