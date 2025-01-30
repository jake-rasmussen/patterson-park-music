import { User } from "@prisma/client";
import EmailView from "./emailView";
import { Divider } from "@nextui-org/react";
import EmailMessageBar from "./emailBar";
import { IconMailX } from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { useFileUpload } from "~/hooks/fileUpload";

type PropType = {
  selectedUser: User;
}

const EmailPanel = (props: PropType) => {
  const { selectedUser } = props;

  const { handleFileUploadEmail } = useFileUpload();

  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = api.useUtils();

  const sendEmail = api.email.sendEmail.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Email sent successfully!");

      setBody("");
      setSubject("");
      setAttachedFiles([]);
      setIsLoading(false);

      utils.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
      toast(
        "If you're adding an attachment, make sure that the file size is less than 1MB",
        {
          duration: 4000,
        }
      );

      setIsLoading(false);
    },
  });


  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      toast.loading("Sending email...");

      const attachments = await handleFileUploadEmail(attachedFiles);
      const formattedBody = body.replace(/\n/g, "<br>");

      sendEmail.mutate({
        to: selectedUser.email || "",
        subject,
        body: formattedBody,
        attachments,
      });
    } catch (error) {
      console.error("Error sending the email:", error);
    }
  };

  return (
    <>
      {
        selectedUser.email ? <>
          <div className="flex-1 min-h-0 overflow-auto bg-gray-50 relative">
            <EmailView selectedUser={selectedUser} email={selectedUser.email} />
          </div>

          <div className="w-full bg-white rounded-br-xl">
            <Divider />
            <div className="p-4">
              <EmailMessageBar
                attachedFiles={attachedFiles}
                setAttachedFiles={setAttachedFiles}
                body={body}
                setBody={setBody}
                subject={subject}
                setSubject={setSubject}
                isSendDisabled={(!body && attachedFiles.length === 0) || isLoading}
                handleSendMessage={handleSendMessage} />
            </div>
          </div>
        </> : <div className="flex flex-col h-full justify-center items-center gap-4">
          <IconMailX className="h-20 w-20" />
        </div>
      }
    </>
  )

}

export default EmailPanel;