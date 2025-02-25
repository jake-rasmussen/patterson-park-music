import { Input } from "@heroui/react";
import { IconPaperclip, IconSend, IconX } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useRef } from "react";

type PropType = {
  attachedImages: File[];
  setAttachedImages: Dispatch<SetStateAction<File[]>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  isSendDisabled: boolean;
  handleSendMessage: () => void;
};

const SMSMessageBar = (props: PropType) => {
  const {
    attachedImages,
    setAttachedImages,
    message,
    isSendDisabled,
    setMessage,
    handleSendMessage
  } = props;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []);
    setAttachedImages((prev) => [...prev, ...files]);
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
            disabled={isSendDisabled}
          >
            <IconSend />
          </button>
        </div>
      </div>
    </>
  );
};

export default SMSMessageBar;
