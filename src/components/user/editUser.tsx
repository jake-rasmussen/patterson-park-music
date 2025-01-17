import { Modal, ModalHeader, ModalBody, ModalContent } from "@nextui-org/react";
import { User, USER_TYPE } from "@prisma/client";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import UserForm from "./userForm";
import { capitalizeToUppercase } from "~/utils/helper";

type PropType = {
  selectedUser: User;
  isOpen: boolean;
  onOpenChange: () => void;
  type: USER_TYPE;
};

const EditUser = (props: PropType) => {
  const { selectedUser, isOpen, onOpenChange, type } = props;

  const utils = api.useUtils();

  const updateUser = api.user.updateUser.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Updated user!");

      utils.user.getAllUsers.invalidate();
      utils.user.getAllTeachers.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Updating user...");

    try {
      await updateUser.mutateAsync({
        id: selectedUser.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        type: values.type,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit {capitalizeToUppercase(type)}</ModalHeader>
            <ModalBody>
              <UserForm
                handleSubmit={async (values: Record<string, any>) => {
                  handleSubmit(values).then(onClose);
                }}
                onClose={onClose}
                initialValues={{
                  firstName: selectedUser.firstName,
                  lastName: selectedUser.lastName,
                  phoneNumber: selectedUser.phoneNumber,
                  email: selectedUser.email,
                  type: selectedUser.type,
                }}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditUser;
