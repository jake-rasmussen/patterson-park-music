import { Input } from "@nextui-org/react";
import { IconPaperclip, IconSend, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

type PropType = {
  to: string;
};

const MessageBar = (props: PropType) => {
  const { to } = props;

  const [message, setMessage] = useState<string>("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);

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

  const sendSMS = api.sms.sendSMS.useMutation({
    onSuccess() {
      toast.success("Message sent successfully!");
      setMessage("");
      setAttachedImages([]);
    },
    onError() {
      toast.error("Failed to send the message");
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []);
    setAttachedImages((prev) => [...prev, ...files]);
  };

  const handleImageUpload = async (): Promise<string[]> => {
    if (attachedImages.length === 0) return [];

    try {
      const urls = await Promise.all(
        attachedImages.map(async (file) => {
          const filePath = `uploads/${Date.now()}-${file.name}`;

          const uploadUrl = await getUploadUrl.mutateAsync({
            bucket: "media",
            filePath,
          });

          if (!uploadUrl) {
            throw new Error("Failed to retrieve upload URL");
          }

          const response = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to upload file");
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
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
      return [];
    }
  };

  const handleSendMessage = async () => {
    try {
      const mediaUrls = await handleImageUpload();

      sendSMS.mutate({
        message,
        to,
        mediaUrls,
      });
    } catch (error) {
      console.error("Error sending the message:", error);
    }
  };

  return (
    <>
      <div className="flex flex-row gap-2">
        {attachedImages.map((file, index) => (
          <div key={index} className="relative group">
            <button
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out m-[2px]"
              onClick={() => {
                setAttachedImages((prevFiles) => prevFiles.filter((_, i) => i !== index));
              }}
            >
              <IconX className="w-4 h-4 bg-gray-300 bg-opacity-75 rounded-full" />
            </button>
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-16 h-16 rounded mb-2" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Input
          className="w-full bg-gray-100 rounded-xl"
          placeholder="Enter Message"
          variant="bordered"
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
        />

        <div className="flex flex-row gap-1 justify-end">
          <input
            type="file"
            accept="image/*"
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
            onClick={handleSendMessage}
            disabled={!message && attachedImages.length === 0}
          >
            <IconSend />
          </button>
        </div>
      </div>
    </>
  );
};

export default MessageBar;
