import { Input, Textarea } from "@nextui-org/react";
import { IconPaperclip, IconSend, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

type PropType = {
  to: string[];
};

const EmailBar = (props: PropType) => {
  const { to } = props;

  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const getUploadUrl = api.file.getUploadUrl.useMutation({
    onError() {
      toast.error("Failed to get upload URL");
    },
  });

  const getPresignedUrl = api.file.getPresignedUrl.useMutation({
    onError() {
      toast.error("Failed to get presigned URL");
    },
  });

  const sendEmail = api.email.sendEmail.useMutation({
    onSuccess() {
      toast.success("Email sent successfully!");
      setBody("");
      setSubject("");
      setAttachedFiles([]);
    },
    onError() {
      toast.error("Failed to send the email");
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleFileUpload = async (): Promise<
    { filename: string; type: string; content: string; url: string }[]
  > => {
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
            throw new Error("Failed to retrieve upload URL");
          }

          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload file to Supabase");
          }

          const publicUrl = await getPresignedUrl.mutateAsync({
            bucket: "media",
            filePath,
          });

          const base64Content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1] || ""); // Strip the base64 header
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
      toast.error("Failed to upload files");
      return [];
    }
  };

  const handleSendEmail = async () => {
    try {
      const attachments = await handleFileUpload();

      sendEmail.mutate({
        to: to as [string, ...string[]],
        subject,
        body,
        attachments,
      });
    } catch (error) {
      console.error("Error sending the email:", error);
    }
  };

  return (
    <>
      <div className="flex flex-row gap-2">
        {attachedFiles.map((file, index) => (
          <div key={index} className="relative group">
            <button
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out m-[2px]"
              onClick={() => {
                setAttachedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
              }}
            >
              <IconX className="w-4 h-4 bg-gray-300 bg-opacity-75 rounded-full" />
            </button>
            <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center mb-2">
              <p className="text-xs truncate">{file.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Input
          className="w-full bg-gray-100 rounded-xl"
          placeholder="Enter Subject"
          variant="bordered"
          value={subject}
          onChange={(e) => setSubject(e.currentTarget.value)}
        />
        <Textarea
          className="w-full bg-gray-100 rounded-xl"
          placeholder="Enter Message"
          variant="bordered"
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
        />

        <div className="flex flex-row gap-1 justify-end">
          <input
            type="file"
            accept="*/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFileAttach}
          />
          <button
            className="transition duration-300 ease-in-out hover:bg-gray-800 hover:text-white rounded-xl p-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconPaperclip />
          </button>

          <button
            className="transition duration-300 ease-in-out hover:bg-gray-800 p-2 hover:text-white rounded-xl disabled:opacity-50 disabled:bg-transparent disabled:text-gray-800"
            onClick={handleSendEmail}
            disabled={!body && attachedFiles.length === 0}
          >
            <IconSend />
          </button>
        </div>
      </div>
    </>
  );
};

export default EmailBar;