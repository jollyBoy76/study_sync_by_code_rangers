"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button"; 

export default function ResourceCenter() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  // Fetch files from database
  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("shared_resources")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setFiles(data);
    if (error) console.error("Error fetching:", error.message);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Handle PDF Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("study-resources")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from("study-resources")
        .getPublicUrl(fileName);

      // 3. Save Record to Database
      await supabase.from("shared_resources").insert([
        { file_name: file.name, file_url: urlData.publicUrl }
      ]);

      fetchResources();
      alert("PDF uploaded and shared with the team! 🚀");
    } catch (error) {
      alert("Upload failed. Check your Supabase Storage policies!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 border rounded-xl bg-card shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Study Resources & PDFs</h2>
        <input 
          type="file" 
          id="pdf-upload" 
          className="hidden" 
          accept=".pdf" 
          onChange={handleUpload} 
        />
        <Button 
          onClick={() => document.getElementById('pdf-upload')?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload New PDF"}
        </Button>
      </div>

      <div className="grid gap-3">
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No resources shared yet.</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <span className="text-sm font-medium truncate">{file.file_name}</span>
              <a 
                href={file.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-500 hover:underline font-semibold"
              >
                Download / View
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}