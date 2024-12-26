import { api } from "~/utils/api";
import toast from "react-hot-toast";

export const useFileUpload = () => {
  const getUploadUrl = api.file.getUploadUrl.useMutation({
    onError() {
      toast.error("Error retrieving upload URL.");
    },
  });

  const getPresignedUrl = api.file.getPresignedUrl.useMutation({
    onError() {
      toast.error("Error retrieving presigned URL.");
    },
  });

  const handleFileUploadEmail = async (
    attachedFiles: File[]
  ): Promise<{ filename: string; type: string; content: string; url: string }[]> => {
    if (attachedFiles.length === 0) return [];

    try {
      const uploadedFiles = await Promise.all(
        attachedFiles.map(async (file) => {
          const filePath = `uploads/${Date.now()}-${file.name}`;

          const uploadUrl = await getUploadUrl.mutateAsync({
            bucket: "media",
            filePath,
          });

          if (!uploadUrl) {
            throw new Error("Failed to retrieve upload URL.");
          }

          const response = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to upload file to Supabase.");
          }

          const publicUrl = await getPresignedUrl.mutateAsync({
            bucket: "media",
            filePath,
          });

          const base64Content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });

          return {
            filename: file.name,
            type: file.type,
            content: base64Content,
            url: publicUrl,
          };
        })
      );

      return uploadedFiles;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files.");
      return [];
    }
  };

  const handleFileUploadSMS = async (attachedFiles: File[]): Promise<string[]> => {
    if (attachedFiles.length === 0) return [];

    try {
      const urls = await Promise.all(
        attachedFiles.map(async (file) => {
          const filePath = `uploads/${Date.now()}-${file.name}`;

          const uploadUrl = await getUploadUrl.mutateAsync({
            bucket: "media",
            filePath,
          });

          if (!uploadUrl) {
            throw new Error("Failed to retrieve upload URL.");
          }

          const response = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to upload file.");
          }

          const publicUrl = await getPresignedUrl.mutateAsync({
            bucket: "media",
            filePath,
          });

          return publicUrl;
        })
      );

      return urls.filter((url) => url !== null) as string[];
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files.");
      return [];
    }
  };

  return { handleFileUploadEmail, handleFileUploadSMS };
};
