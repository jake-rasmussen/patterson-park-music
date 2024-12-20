import { Contact } from "@prisma/client";
import EmailView from "./emailView";
import { Divider } from "@nextui-org/react";
import EmailMessageBar from "./emailBar";
import { IconMailX } from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

type PropType = {
  selectedContact: Contact;
}

const EmailPanel = (props: PropType) => {
  const { selectedContact } = props;

  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
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
      toast.error("Error...");
      return [];
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsLoading(true);
      toast.loading("Sending email...");

      const attachments = await handleFileUpload();
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
                handleSendMessage={handleSendEmail} />
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