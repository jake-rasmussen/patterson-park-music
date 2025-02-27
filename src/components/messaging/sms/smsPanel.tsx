import { Divider } from "@heroui/react";
import { IconMessageX } from "@tabler/icons-react";
import SMSView from "./smsView";
import SMSMessageBar from "./smsBar";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { User } from "@prisma/client";
import { useFileUpload } from "~/hooks/fileUpload";

type PropType = {
  selectedUser: User;
}

const SMSPanel = (props: PropType) => {
  const { selectedUser } = props;

  const { handleFileUploadSMS } = useFileUpload();

  const [message, setMessage] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = api.useUtils();

  const sendSMS = api.sms.sendSMS.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Message sent successfully!");

      setMessage("");
      setAttachedFiles([]);
      setIsLoading(false);

      utils.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");

      setIsLoading(false);
    },
  });

  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      toast.loading("Sending message...");

      const mediaUrls = await handleFileUploadSMS(attachedFiles);

      sendSMS.mutate({
        message,
        to: selectedUser.phoneNumber,
        mediaUrls,
      });
    } catch (error) {
      console.error("Error sending the message:", error);
    }
  };

  return (<>
    {
      selectedUser.phoneNumber ? <>
        <div className="flex-1 min-h-0 overflow-auto bg-gray-50 relative">
          <SMSView selectedUser={selectedUser} />
        </div>

        <div className="w-full bg-white rounded-br-xl">
          <Divider />
          <div className="p-4">
            <SMSMessageBar
              attachedImages={attachedFiles}
              setAttachedImages={setAttachedFiles}
              message={message}
              setMessage={setMessage}
              isSendDisabled={(!message && attachedFiles.length === 0) || isLoading}
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