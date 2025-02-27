import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import UserForm from "./userForm";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { enumToStr } from "~/utils/helper";
import { USER_TYPE } from "@prisma/client";

type PropType = {
  isOpen: boolean;
  onOpenChange: () => void;
  type: USER_TYPE;
}

const CreateUserModal = (props: PropType) => {
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
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      type: values.type,
      interests: values.interests,
      pronouns: values.pronouns,
      birthday: values.birthday,
      school: values.school,
    });
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Create {enumToStr(type)}</ModalHeader>
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

export default CreateUserModal;