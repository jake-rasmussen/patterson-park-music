import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { IconEdit } from "@tabler/icons-react";
import { Field, Form } from "houseform";
import toast from "react-hot-toast";
import z from "zod";
import { api } from "~/utils/api";
import UserForm from "../user/userForm";

const CreateMessage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const utils = api.useUtils();

  const createUser = api.user.createUser.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully created user!");

      utils.user.getAllUsers.invalidate();
      utils.user.getAllTeachers.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    }
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Creating user...");

    await createUser.mutateAsync({
      firstName: values.first,
      lastName: values.last,
      phoneNumber: values.phone,
      email: values.email,
      type: values.type,
    });
  }

  return (
    <>
      <button onClick={onOpen}>
        <IconEdit
          className="w-10 h-10 transition duration-300 ease-in-out hover:scale-110 hover:cursor-pointer"
        />
      </button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Enter Contact Details</ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <UserForm handleSubmit={handleSubmit} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateMessage;
