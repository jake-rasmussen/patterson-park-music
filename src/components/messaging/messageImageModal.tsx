import { useState } from "react";
import { Button } from "@heroui/button";
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Tooltip } from "@heroui/react";
import { IconExclamationCircle, IconInfoCircle } from "@tabler/icons-react";

type PropType = {
  imageUrl: string;
};

const MessageImageModal = ({ imageUrl }: PropType) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [error, setError] = useState(false);

  return (
    <>
      {!error ? (
        <img
          src={imageUrl}
          alt="Attached"
          className="mt-2 rounded-lg max-w-full max-h-60 object-cover hover:cursor-pointer"
          onClick={onOpen}
          onError={() => setError(true)}
        />
      ) : (
        <Tooltip color="warning" content="Attachment(s) could not be loaded" placement="right">
          <IconInfoCircle className="text-yellow-500" />
        </Tooltip>
      )}

      {!error && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Preview Image</ModalHeader>
                <ModalBody>
                  <img
                    src={imageUrl}
                    alt="Attached"
                    className="mt-2 rounded-lg max-w-full object-fill hover:cursor-pointer"
                    onClick={onOpen}
                    onError={() => setError(true)}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default MessageImageModal;
