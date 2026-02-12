import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useFacultyMembers,
  useCreateFacultyMember,
  useUpdateFacultyMember,
  useDeleteFacultyMember,
  type FacultyMember,
  type FacultyMemberInsert,
} from "@/hooks/useFacultyMembers";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const DEPARTMENTS = ["Cinematography", "Post-Production", "Directing", "Production"];

const emptyForm: FacultyMemberInsert & { intro_video_url: string | null } = {
  name: "",
  role: "",
  department: "Cinematography",
  expertise: [],
  bio: "",
  featured: false,
  display_order: 0,
  image_url: null,
  intro_video_url: null,
};

export default function FacultyManager() {
  const { data: members, isLoading } = useFacultyMembers();
  const createMutation = useCreateFacultyMember();
  const updateMutation = useUpdateFacultyMember();
  const deleteMutation = useDeleteFacultyMember();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FacultyMember | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExpertiseInput("");
    setDialogOpen(true);
  };

  const openEdit = (m: FacultyMember) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      role: m.role,
      department: m.department,
      expertise: m.expertise,
      bio: m.bio ?? "",
      featured: m.featured,
      display_order: m.display_order,
      image_url: m.image_url,
      intro_video_url: m.intro_video_url,
    });
    setExpertiseInput(m.expertise.join(", "));
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `faculty/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    const expertise = expertiseInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { ...form, expertise };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Faculty Manager" description="Add, edit, or remove faculty members.">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Faculty
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.department}</Badge>
                    </TableCell>
                    <TableCell>{m.featured ? "⭐" : "—"}</TableCell>
                    <TableCell>{m.display_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(m)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(m)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {members?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No faculty members yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Faculty Member" : "Add Faculty Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Role *</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Department *</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Bio</Label>
              <Textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1">
              <Label>Expertise (comma-separated)</Label>
              <Input value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} placeholder="Lighting, Camera Movement, ..." />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>Faculty Photo</Label>
              {form.image_url && (
                <div className="w-20 h-20 rounded border border-border overflow-hidden mb-2">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="gap-2"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload Photo
                </Button>
              </div>
              <Input
                value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value || null })}
                placeholder="Or paste image URL..."
                className="text-xs"
              />
            </div>

            {/* Intro Video URL */}
            <div className="space-y-1">
              <Label>Intro Video URL</Label>
              <Input
                value={form.intro_video_url ?? ""}
                onChange={(e) => setForm({ ...form, intro_video_url: e.target.value || null })}
                placeholder="YouTube, Vimeo, or direct video URL"
              />
            </div>

            <div className="space-y-1">
              <Label>Display Order</Label>
              <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <Label>Featured (Department Head)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.role || isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this faculty member. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
