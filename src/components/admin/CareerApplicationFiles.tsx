import { useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import IconTooltipButton from "@/components/admin/IconTooltipButton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";

const BUCKET = "career-application-files";
const MAX_BYTES = 20 * 1024 * 1024; // 20MB

type FileRow = Tables<"career_application_files">;

const formatSize = (bytes?: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface Props {
  applicationId: string;
}

const CareerApplicationFiles = ({ applicationId }: Props) => {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<FileRow | null>(null);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["career-application-files", applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_application_files")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FileRow[];
    },
  });

  const handleFiles = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      for (const file of Array.from(selected)) {
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} exceeds the 20MB limit`);
          continue;
        }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${applicationId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        const { error: insertError } = await supabase
          .from("career_application_files")
          .insert({
            application_id: applicationId,
            file_name: file.name,
            storage_path: path,
            file_size: file.size,
            mime_type: file.type || null,
            uploaded_by: user?.id || null,
          });
        if (insertError) {
          await supabase.storage.from(BUCKET).remove([path]);
          throw insertError;
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["career-application-files", applicationId] });
      toast.success("Files uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const downloadFile = async (file: FileRow) => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(file.storage_path, 60, { download: file.file_name });
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Failed to download file");
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (file: FileRow) => {
      const { error: storageErr } = await supabase.storage.from(BUCKET).remove([file.storage_path]);
      if (storageErr) throw storageErr;
      const { error } = await supabase.from("career_application_files").delete().eq("id", file.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-application-files", applicationId] });
      toast.success("File deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete file"),
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Attachments</h2>
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-4 w-4 mr-1" /> Upload files</>
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : files.length === 0 ? (
        <div
          className="border border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to upload CV, cover letter, or other documents
          </p>
          <p className="text-xs text-muted-foreground mt-1">Max 20MB per file</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.file_size)} · {format(new Date(file.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconTooltipButton label="Download" className="h-8 w-8" onClick={() => downloadFile(file)}>
                  <Download className="h-4 w-4" />
                </IconTooltipButton>
                <IconTooltipButton
                  label="Delete"
                  className="h-8 w-8 hover:bg-destructive hover:text-white"
                  onClick={() => setDeleting(file)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconTooltipButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.file_name} will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && deleteMutation.mutate(deleting)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CareerApplicationFiles;
