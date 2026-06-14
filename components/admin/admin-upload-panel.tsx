"use client";

import { useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Link2, Loader2, Upload } from "lucide-react";

import { DocumentMonitorDashboard } from "@/components/admin/document-monitor-dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  confirmFileUpload,
  createUploadUrl,
  submitDocumentUrl,
  uploadFileToS3,
} from "@/lib/api/documents";
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_MIME_TYPES,
} from "@/lib/document-utils";

export function AdminUploadPanel() {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);
  const [monitorKey, setMonitorKey] = useState(0);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  async function handleFileUpload() {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file để tải lên");
      return;
    }

    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase() ?? ""}`;
    const isAllowedType =
      ACCEPTED_MIME_TYPES.includes(selectedFile.type) ||
      ACCEPTED_FILE_TYPES.includes(extension);

    if (!isAllowedType) {
      toast.error("Định dạng file không được hỗ trợ");
      return;
    }

    setIsUploadingFile(true);

    try {
      const token = await getToken();
      const uploadData = await createUploadUrl(
        {
          filename: selectedFile.name,
          file_type: selectedFile.type || "application/octet-stream",
          file_size: selectedFile.size,
        },
        token
      );

      await uploadFileToS3(uploadData.upload_url, selectedFile);
      await confirmFileUpload(uploadData.s3_key, token);

      toast.success("Tải file thành công. Tài liệu đang được xử lý.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMonitorKey((current) => current + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Tải file thất bại"
      );
    } finally {
      setIsUploadingFile(false);
    }
  }

  async function handleUrlSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      toast.error("Vui lòng nhập URL");
      return;
    }

    setIsSubmittingUrl(true);

    try {
      const token = await getToken();
      await submitDocumentUrl(trimmedUrl, token);
      toast.success("URL đã được thêm. Tài liệu đang được xử lý.");
      setUrlInput("");
      setMonitorKey((current) => current + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Xử lý URL thất bại"
      );
    } finally {
      setIsSubmittingUrl(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Quản trị tài liệu
        </h1>
        <p className="text-sm text-muted-foreground">
          Tải file hoặc thêm URL để trợ lý có thể đọc và trả lời dựa trên nội
          dung đó.
        </p>
      </div>

      <Tabs defaultValue="file">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Tải file lên</TabsTrigger>
          <TabsTrigger value="url">Thêm URL</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Tải tài liệu pháp lý</CardTitle>
              <CardDescription>
                Hỗ trợ PDF, DOC, DOCX, TXT, HTML. Tài liệu sẽ được lưu trữ và xử
                lý tự động để trợ lý sử dụng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Chọn file</Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES.join(",")}
                  onChange={handleFileChange}
                  disabled={isUploadingFile}
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    {selectedFile.name} ·{" "}
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <Button
                onClick={() => void handleFileUpload()}
                disabled={!selectedFile || isUploadingFile}
                className="gap-2"
              >
                {isUploadingFile ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {isUploadingFile ? "Đang tải lên..." : "Tải lên và xử lý"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>Thêm nguồn từ URL</CardTitle>
              <CardDescription>
                Nhập liên kết trang web pháp lý để thu thập nội dung cho trợ lý.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-url">URL</Label>
                  <Input
                    id="document-url"
                    type="url"
                    placeholder="https://example.com/van-ban-phap-lu"
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    disabled={isSubmittingUrl}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!urlInput.trim() || isSubmittingUrl}
                  className="gap-2"
                >
                  {isSubmittingUrl ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Link2 className="size-4" />
                  )}
                  {isSubmittingUrl ? "Đang xử lý..." : "Thêm và xử lý"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DocumentMonitorDashboard
        key={monitorKey}
        showHeader={false}
        title="Theo dõi xử lý tài liệu"
        description="Giám sát tiến trình phân tích và chuẩn bị tài liệu cho trợ lý."
      />
    </div>
  );
}
