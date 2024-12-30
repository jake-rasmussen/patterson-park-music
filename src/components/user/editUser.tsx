import { Modal, ModalHeader, ModalBody, ModalContent } from "@nextui-org/react";
import { User } from "@prisma/client";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import UserForm from "./userForm";

type PropType = {
  selectedUser: User;
  isOpen: boolean;
  onOpenChange: () => void;
  isTeacher: boolean;
};

const EditUser = (props: PropType) => {
  const { selectedUser, isOpen, onOpenChange, isTeacher } = props;

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
            <ModalHeader>Edit {isTeacher ? "Teacher" : "Student"}</ModalHeader>
            <ModalBody>
              <UserForm
                handleSubmit={handleSubmit}
                onClose={onClose}
                initialValues={{
                  firstName: selectedUser.firstName,
                  lastName: selectedUser.lastName,
                  phoneNumber: selectedUser.phoneNumber,
                  email: selectedUser.email,
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
