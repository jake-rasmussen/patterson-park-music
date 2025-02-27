import { Modal, Divider, Button, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Family, User } from "@prisma/client";
import { useEffect, useState } from "react";

type PropType = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: (User & {
    family: Family | null;
  });
  message: string;
  subject?: string;
  type: "sms" | "email";
  attachedFiles: File[];
};

const PreviewBulkMessageModal = (props: PropType) => {
  const { isOpen, onOpenChange, user, message, subject, type, attachedFiles } = props;

  const [previewMessage, setPreviewMessage] = useState("");

  useEffect(() => {
    const processedMessage = message
      .replace(/\[First Name\]/g, user.firstName)
      .replace(/\[Last Name\]/g, user.lastName)
      .replace(/\[Family Name\]/g, user.family ? user.family.familyName : "N/A");
    setPreviewMessage(processedMessage);
  }, [user, message]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-2 text-lg font-bold">
              Preview {type === "sms" ? "SMS" : "Email"}
            </ModalHeader>
            <ModalBody>
              {type === "sms" ? (
                <div className="bg-gray-50 p-4 rounded shadow-sm">
                  <h3 className="text-sm font-semibold mb-2">SMS Preview</h3>
                  <p className="text-base">{previewMessage}</p>
                </div>
              ) : (
                <div className="flex flex-col leading-1.5 p-4  bg-gray-800 rounded-xl shadow-xl">
                  <div className="mt-2">
                    <p className="text-white text-lg">{subject}</p>
                    <Divider className="bg-white" />
                  </div>
                  <div className="text-sm font-normal py-2.5 text-white" dangerouslySetInnerHTML={{ __html: previewMessage }} />
                  {attachedFiles && (
                    <div className="flex flex-row gap-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img src={URL.createObjectURL(file)} alt="Preview" className="w-16 h-16 rounded mb-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2">
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PreviewBulkMessageModal;