import { Input, Textarea } from "@nextui-org/react";
import { IconPaperclip, IconSend } from "@tabler/icons-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

type PropType = {
  to: string;
}

const MessageBar = (props: PropType) => {
  const { to } = props;

  const [message, setMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // For previewing the image
  const [subject, setSubject] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string); // Convert to a data URL for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const sendEmail = api.email.sendEmail.useMutation({
    onSuccess() {
      toast.success("Email sent successfully!");
    },
    onError() {
      toast.error("Error...");
    },
  });

  const handleSendEmail = () => {
    sendEmail.mutate({
      to,
      subject,
      message,
    });
  };

  return (<>
    <div className="flex flex-col gap-2 items-end">
      <Input 
        className="w=full" 
        placeholder="Enter Subject"
        variant="bordered"
        value={subject}
        onChange={(e) => setSubject(e.currentTarget.value)}
      />
      <Textarea
        className="w-full bg-gray-100 rounded-xl"
        placeholder="Enter Message"
        variant="bordered"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />

      <div className="flex flex-row gap-1">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        <button
          className="transition duration-300 ease-in-out hover:bg-gray-800 hover:text-white rounded-xl disabled:opacity-50 disabled:bg-transparent disabled:text-gray-800 p-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconPaperclip />
        </button>
        {imageUrl && <img src={imageUrl} alt="Preview" className="w-32 h-32 mb-2" />}
        <button
          className="transition duration-300 ease-in-out hover:bg-gray-800 hover:text-white rounded-xl disabled:opacity-50 disabled:bg-transparent disabled:text-gray-800 p-2"
          onClick={() => {
            handleSendEmail();
            setMessage("");
          }}
          disabled={message.length === 0}
        >
          <IconSend />
        </button>
      </div>

    </div>
  </>);
}

export default MessageBar;