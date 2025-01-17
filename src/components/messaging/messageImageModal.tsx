import { Button } from "@nextui-org/button";
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";

type PropType = {
  imageUrl: string;
}

const MessageImageModal = (props: PropType) => {
  const { imageUrl } = props;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <img
        src={imageUrl}
        key={imageUrl}
        alt="Attached"
        className="mt-2 rounded-lg max-w-full max-h-60 object-cover hover:cursor-pointer"
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Preview Image</ModalHeader>
              <ModalBody>
                <img
                  src={imageUrl}
                  key={imageUrl}
                  alt="Attached"
                  className="mt-2 rounded-lg max-w-full object-fill hover:cursor-pointer"
                  onClick={onOpen}
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
    </>

  )


}

export default MessageImageModal;