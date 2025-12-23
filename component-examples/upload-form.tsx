"use client";

import { useState } from "react";

// use our own svg icons instead
import { Upload, X, File } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// For example only
import { Card, CardContent } from "@/components/ui/card";

export const title = "React Contact Block Upload";

export default function ContactUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <section className="py-12">
      <div className="mx-auto w-full max-w-xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Submit a Request
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Attach any relevant files to help us understand your inquiry.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form action="#" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Attachment (Optional)</Label>
                {!selectedFile ? (
                  <label
                    htmlFor="file-upload"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors hover:bg-muted/50"
                  >
                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm">Click to upload</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, PNG, JPG up to 10MB
                    </p>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Button className="w-full">Submit Request</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
