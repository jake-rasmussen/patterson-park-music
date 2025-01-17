import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import UserForm from "./userForm";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { capitalizeToUppercase } from "~/utils/helper";
import { USER_TYPE } from "@prisma/client";

type PropType = {
  isOpen: boolean;
  onOpenChange: () => void;
  type: USER_TYPE;
}

const CreateUser = (props: PropType) => {
  const { isOpen, onOpenChange, type } = props;

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Create {capitalizeToUppercase(type)}</ModalHeader>
            <ModalBody>
              <UserForm
                handleSubmit={async (values: Record<string, any>) => {
                  await handleSubmit(values);
                  onClose();
                }}
                onClose={onClose}
                initialValues={{
                  type
                }}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )

}

export default CreateUser;