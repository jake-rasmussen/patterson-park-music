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
  selectedContact: User;
}

const EmailPanel = (props: PropType) => {
  const { selectedContact } = props;

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
        to: [selectedContact.email] as [string, ...string[]],
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
        selectedContact.email ? <>
          <div className="flex-1 min-h-0 overflow-auto bg-gray-50 relative">
            <EmailView selectedContact={selectedContact} email={selectedContact.email} />
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