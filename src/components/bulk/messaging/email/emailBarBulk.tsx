import { Button, Input, Textarea } from "@heroui/react";
import { IconPaperclip, IconSend, IconX } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useRef } from "react";

type PropType = {
  attachedFiles: File[];
  setAttachedFiles: Dispatch<SetStateAction<File[]>>;
  body: string;
  setBody: Dispatch<SetStateAction<string>>;
  subject: string;
  setSubject: Dispatch<SetStateAction<string>>;
  placeholders: {
    key: string;
    label: string;
  }[];
};

const EmailMessageBar = (props: PropType) => {
  const {
    attachedFiles,
    setAttachedFiles,
    body,
    setBody,
    subject,
    setSubject,
    placeholders,
  } = props;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const insertPlaceholder = (placeholder: { key: string; label: string }) => {
    setBody((prev) => prev + ` [${placeholder.label}] `);
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {placeholders.map((placeholder) => (
          <Button key={placeholder.key} size="sm" onPress={() => insertPlaceholder(placeholder)}>
            {placeholder.label}
          </Button>
        ))}
      </div>

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
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-16 h-16 rounded mb-2" />
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
        </div>
      </div>
    </div>
  );
};

export default EmailMessageBar;