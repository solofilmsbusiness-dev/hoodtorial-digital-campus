import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Calendar, 
  Award, 
  Users, 
  Trash2, 
  Edit,
  Flame,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import { cn } from "@/lib/utils";

interface ChallengeFormData {
  title: string;
  description: string;
  prompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  credits_reward: number;
  category: 'lighting' | 'composition' | 'movement' | 'storytelling' | 'general';
  active_date: string;
  is_active: boolean;
}

const defaultFormData: ChallengeFormData = {
  title: '',
  description: '',
  prompt: '',
  difficulty: 'beginner',
  credits_reward: 0.5,
  category: 'general',
  active_date: new Date().toISOString().split('T')[0],
  is_active: true,
};

export default function ChallengeManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<DailyChallenge | null>(null);
  const [formData, setFormData] = useState<ChallengeFormData>(defaultFormData);

  // Fetch all challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .order('active_date', { ascending: false });

      if (error) throw error;
      return data as DailyChallenge[];
    },
  });

  // Fetch submission stats
  const { data: stats } = useQuery({
    queryKey: ['challenge-stats'],
    queryFn: async () => {
      const { data: submissions, error } = await supabase
        .from('challenge_submissions')
        .select('challenge_id');

      if (error) throw error;

      const countByChallenge: Record<string, number> = {};
      (submissions || []).forEach(s => {
        countByChallenge[s.challenge_id] = (countByChallenge[s.challenge_id] || 0) + 1;
      });

      return {
        totalSubmissions: submissions?.length || 0,
        byChallenge: countByChallenge,
      };
    },
  });

  // Create/update challenge
  const saveMutation = useMutation({
    mutationFn: async (data: ChallengeFormData) => {
      if (editingChallenge) {
        const { error } = await supabase
          .from('daily_challenges')
          .update({
            title: data.title,
            description: data.description,
            prompt: data.prompt,
            difficulty: data.difficulty,
            credits_reward: data.credits_reward,
            category: data.category,
            active_date: data.active_date,
            is_active: data.is_active,
          })
          .eq('id', editingChallenge.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_challenges')
          .insert({
            title: data.title,
            description: data.description,
            prompt: data.prompt,
            difficulty: data.difficulty,
            credits_reward: data.credits_reward,
            category: data.category,
            active_date: data.active_date,
            is_active: data.is_active,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success(editingChallenge ? 'Challenge updated!' : 'Challenge created!');
      setIsDialogOpen(false);
      setEditingChallenge(null);
      setFormData(defaultFormData);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete challenge
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Challenge deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (challenge: DailyChallenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      prompt: challenge.prompt,
      difficulty: challenge.difficulty,
      credits_reward: challenge.credits_reward,
      category: challenge.category,
      active_date: challenge.active_date,
      is_active: challenge.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const today = new Date().toISOString().split('T')[0];

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <AdminLayout title="Challenge Manager" description="Create and manage daily challenges">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingChallenge(null);
              setFormData(defaultFormData);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="btn-brutal gap-2">
                <Plus className="h-4 w-4" />
                New Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingChallenge ? 'Edit Challenge' : 'Create Challenge'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Light Study"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the challenge"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Challenge Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="Detailed instructions for students"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select 
                      value={formData.difficulty} 
                      onValueChange={(v) => setFormData({ ...formData, difficulty: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData({ ...formData, category: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="lighting">Lighting</SelectItem>
                        <SelectItem value="composition">Composition</SelectItem>
                        <SelectItem value="movement">Movement</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits Reward</Label>
                    <Input
                      id="credits"
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="5"
                      value={formData.credits_reward}
                      onChange={(e) => setFormData({ ...formData, credits_reward: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Active Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.active_date}
                      onChange={(e) => setFormData({ ...formData, active_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <Label htmlFor="active">Active</Label>
                    <p className="text-xs text-muted-foreground">Make visible to students</p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : editingChallenge ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Challenges</p>
                <p className="text-2xl font-bold">{challenges.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{stats?.totalSubmissions || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">
                  {challenges.filter(c => c.active_date === today && c.is_active).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No challenges created yet. Create your first one!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges.map((challenge) => (
                    <TableRow key={challenge.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(challenge.active_date), 'MMM d')}
                        {challenge.active_date === today && (
                          <Badge className="ml-2 bg-primary/20 text-primary border-0 text-[10px]">
                            TODAY
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {challenge.title}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border text-xs", difficultyColors[challenge.difficulty])}>
                          {challenge.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-sm text-muted-foreground">
                        {challenge.category}
                      </TableCell>
                      <TableCell className="font-mono">
                        +{challenge.credits_reward}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{stats?.byChallenge[challenge.id] || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {challenge.is_active ? (
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(challenge)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm('Delete this challenge?')) {
                                deleteMutation.mutate(challenge.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
