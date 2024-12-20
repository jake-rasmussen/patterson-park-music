import { Contact } from "@prisma/client";
import { Divider } from "@nextui-org/react";
import { IconMailX, IconMessageX } from "@tabler/icons-react";
import SMSView from "./smsView";
import SMSMessageBar from "./smsBar";
import { useState, useRef, SetStateAction } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

type PropType = {
  selectedContact: Contact;
}

const SMSPanel = (props: PropType) => {
  const { selectedContact } = props;


  const [message, setMessage] = useState<string>("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = api.useUtils();

  const getUploadUrl = api.file.getUploadUrl.useMutation({
    onError() {
      toast.error("Error...");
    },
  });

  const getPresignedUrl = api.file.getPresignedUrl.useMutation({
    onError() {
      toast.error("Error...");
    },
  });

  const sendSMS = api.sms.sendSMS.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Message sent successfully!");

      setMessage("");
      setAttachedImages([]);
      setIsLoading(false);

      utils.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");

      setIsLoading(false);
    },
  });

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
      toast.error("Error...");
      return [];
    }
  };

  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      toast.loading("Sending message...");

      const mediaUrls = await handleImageUpload();

      sendSMS.mutate({
        message,
        to: selectedContact.phoneNumber,
        mediaUrls,
      });
    } catch (error) {
      console.error("Error sending the message:", error);
    }
  };

  return (<>
    {
      selectedContact.phoneNumber ? <>
        <div className="flex-1 min-h-0 overflow-auto bg-gray-50 relative">
          <SMSView selectedContact={selectedContact} />
        </div>

        <div className="w-full bg-white rounded-br-xl">
          <Divider />
          <div className="p-4">
            <SMSMessageBar
              attachedImages={attachedImages}
              setAttachedImages={setAttachedImages}
              message={message}
              setMessage={setMessage}
              isSendDisabled={(!message && attachedImages.length === 0) || isLoading}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </> : <div className="flex flex-col h-full justify-center items-center gap-4">
        <IconMessageX className="h-20 w-20" />
      </div>
    }
  </>);
}

export default SMSPanel;