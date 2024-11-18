import { Input } from "@nextui-org/react";
import { IconPaperclip, IconSend, IconX, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

type PropType = {
  to: string;
};

const MessageBar = (props: PropType) => {
  const { to } = props;
  
  const [message, setMessage] = useState<string>("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]); // Store attached files without uploading
  const [imageUrls, setImageUrls] = useState<string[]>([]); // Array to hold URLs for uploaded images

  const getUploadUrl = api.file.getUploadUrl.useMutation({
    onSuccess() {
      // Handle success if needed
    },
    onError() {
      // Handle error if needed
    }
  });

  const getPresignedUrl = api.file.getPresignedUrl.useMutation({
    onSuccess() {
      // Handle success if needed
    },
    onError() {
      // Handle error if needed
    }
  });

  const sendSMS = api.sms.sendSMS.useMutation({
    onSuccess() {
      toast.success("Sent Message!");
      setMessage("");
      setAttachedImages([]);
      setImageUrls([]);
    },
    onError() {
      toast.error("Error...");
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileAttach = (event: any) => {
    const files: File[] = Array.from(event.target.files);
    setAttachedImages(files); // Only attach files, don’t upload yet
  };

  const handleImageUpload = async () => {
    // Upload files and generate URLs
    const urls = await Promise.all(
      attachedImages.map(async (file) => {
        const filePath = `uploads/${Date.now()}-${file.name}`;

        // Request presigned upload URL from fileRouter
        const uploadUrl = await getUploadUrl.mutateAsync({
          bucket: "media",
          filePath
        });

        if (!uploadUrl) {
          throw new Error("Failed to retrieve upload URL");
        }

        // Upload file to the presigned URL
        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to upload file to Supabase");
        }

        // Request a public URL for the uploaded file
        const publicUrl = await getPresignedUrl.mutateAsync({
          bucket: "media",
          filePath,
        });

        return publicUrl;
      })
    );

    setImageUrls(urls.filter((url) => url !== null) as string[]); // Set uploaded URLs
    setAttachedImages([]); // Clear attached images after upload
  };

  return (
    <>
      {/* Display attached image previews with option to remove */}
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
            onChange={handleFileAttach} // Attach files without uploading
          />
          <button
            className="transition duration-300 ease-in-out hover:bg-gray-800 hover:text-white rounded-xl p-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconPaperclip />
          </button>

          <button
            className="transition duration-300 ease-in-out hover:bg-gray-800 p-2 hover:text-white rounded-xl disabled:opacity-50 disabled:bg-transparent disabled:text-gray-800"
            onClick={() => {
              handleImageUpload().then(() => {
                sendSMS.mutate({
                  message,
                  to,
                  mediaUrl: imageUrls, // Send array of URLs for the uploaded images
                });
              });
            }}
            disabled={!message}
          >
            <IconSend />
          </button>
        </div>
      </div>
    </>
  );
};

export default MessageBar;
