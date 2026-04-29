import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import IconTooltipButton from "@/components/admin/IconTooltipButton";

interface Redirect {
  id: string;
  source_path: string;
  destination_path: string;
  status_code: number;
  enabled: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  source_path: "",
  destination_path: "",
  status_code: 301,
  enabled: true,
  notes: "",
};

const Redirects = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Redirect | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: redirects = [], isLoading } = useQuery({
    queryKey: ["url-redirects"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("url_redirects")
        .select("*")
        .order("source_path", { ascending: true });
      if (error) throw error;
      return (data || []) as Redirect[];
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (r: Redirect) => {
    setEditing(r);
    setForm({
      source_path: r.source_path,
      destination_path: r.destination_path,
      status_code: r.status_code,
      enabled: r.enabled,
      notes: r.notes || "",
    });
    setOpen(true);
  };

  const normalize = (p: string) => {
    const t = p.trim();
    if (!t) return t;
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    return t.startsWith("/") ? t : `/${t}`;
  };

  const handleSave = async () => {
    const source = normalize(form.source_path);
    const dest = normalize(form.destination_path);
    if (!source || !dest) {
      toast.error("Source and destination are required");
      return;
    }
    setSaving(true);
    const payload = {
      source_path: source,
      destination_path: dest,
      status_code: form.status_code,
      enabled: form.enabled,
      notes: form.notes || null,
    };
    const { error } = editing
      ? await (supabase as any).from("url_redirects").update(payload).eq("id", editing.id)
      : await (supabase as any).from("url_redirects").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message || "Failed to save redirect");
      return;
    }
    toast.success(editing ? "Redirect updated" : "Redirect added");
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["url-redirects"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    const { error } = await (supabase as any).from("url_redirects").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Redirect deleted");
    queryClient.invalidateQueries({ queryKey: ["url-redirects"] });
  };

  const toggleEnabled = async (r: Redirect) => {
    const { error } = await (supabase as any)
      .from("url_redirects")
      .update({ enabled: !r.enabled })
      .eq("id", r.id);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["url-redirects"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Redirects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage URL redirects for legacy paths. Useful when migrating from an old site so visitors and search
            engines land on the right pages.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" /> Add redirect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit redirect" : "Add redirect"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source path</Label>
                <Input
                  id="source"
                  placeholder="/old-page"
                  value={form.source_path}
                  onChange={(e) => setForm({ ...form, source_path: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  The legacy URL on the previous site (e.g. <code>/old-page</code>).
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="/new-page"
                  value={form.destination_path}
                  onChange={(e) => setForm({ ...form, destination_path: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Internal path (e.g. <code>/about-us</code>) or full URL.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status code</Label>
                  <Select
                    value={String(form.status_code)}
                    onValueChange={(v) => setForm({ ...form, status_code: parseInt(v, 10) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="301">301 — Permanent</SelectItem>
                      <SelectItem value="302">302 — Temporary</SelectItem>
                      <SelectItem value="307">307 — Temporary (preserve method)</SelectItem>
                      <SelectItem value="308">308 — Permanent (preserve method)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Enabled</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      checked={form.enabled}
                      onCheckedChange={(v) => setForm({ ...form, enabled: v })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Add redirect"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="hidden sm:table-cell"></TableHead>
              <TableHead className="hidden md:table-cell">Destination</TableHead>
              <TableHead className="hidden lg:table-cell">Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : redirects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No redirects yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              redirects.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm text-foreground">{r.source_path}</TableCell>
                  <TableCell className="w-6 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-foreground">{r.destination_path}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.status_code}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={r.enabled} onCheckedChange={() => toggleEnabled(r)} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {r.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <IconTooltipButton label="Edit" onClick={() => openEdit(r)}>
                        <Pencil className="w-4 h-4" />
                      </IconTooltipButton>
                      <IconTooltipButton label="Delete" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </IconTooltipButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Note</p>
        <p>
          Redirects defined here are stored and ready to be enforced once your domain is switched to this site. The
          mapping list is preserved so deep links from search engines and external sites continue to work.
        </p>
      </div>
    </div>
  );
};

export default Redirects;
