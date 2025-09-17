import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const IssuesManager = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase.from('issues').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setIssues(data);
    } catch (error: any) {
      toast.error("Failed to fetch issues", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();

    const channel = supabase.channel('issues-manager-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, payload => {
        fetchIssues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (issueId: number, newStatus: string) => {
    const originalIssues = [...issues];
    const newIssues = issues.map(issue => 
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    );
    setIssues(newIssues);

    try {
      const { error } = await supabase.from('issues').update({ status: newStatus }).eq('id', issueId);
      if (error) throw error;
      toast.success("Issue status updated successfully");
    } catch (error: any) {
      setIssues(originalIssues);
      toast.error("Failed to update issue status", { description: error.message });
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TableHead key={index}><Skeleton className="h-6 w-full" /></TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 10 }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: 5 }).map((_, cellIndex) => (
                                <TableCell key={cellIndex}><Skeleton className="h-6 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">All Issues</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium">{issue.title}</TableCell>
                <TableCell>{issue.category}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      issue.status === 'resolved' ? 'success' : 
                      issue.status === 'in-progress' ? 'secondary' : 'outline'
                    }
                  >
                    {issue.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(issue.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">...</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'pending')}>Mark as Pending</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'in-progress')}>Mark as In Progress</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'resolved')}>Mark as Resolved</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {issues.length === 0 && <p className="text-center text-muted-foreground mt-8">No issues found.</p>}
    </div>
  );
};
