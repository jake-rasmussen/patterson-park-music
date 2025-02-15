import { Modal, ModalHeader, ModalBody, ModalContent } from "@nextui-org/react";
import { Enrollment, Family, User, USER_TYPE } from "@prisma/client";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import UserForm from "./userForm";
import { capitalizeToUppercase } from "~/utils/helper";
import { Dispatch, SetStateAction } from "react";

type PropType = {
  selectedUser: User;
  isOpen: boolean;
  onOpenChange: () => void;
  type: USER_TYPE;
  setSelectedUser: Dispatch<SetStateAction<(User & { family: Family | null; enrollment: Enrollment[] }) | undefined>>;
};

const EditUserModal = (props: PropType) => {
  const { selectedUser, isOpen, onOpenChange, type, setSelectedUser } = props;

  const utils = api.useUtils();

  const updateUser = api.user.updateUser.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Updated user!");

      utils.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Updating user...");

    try {
      const updatedUser = await updateUser.mutateAsync({
        id: selectedUser.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        type: values.type,
        interests: values.interests,
        pronouns: values.pronouns,
        birthday: values.birthday,
        school: values.school,
      });

      setSelectedUser(updatedUser);
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
                  interests: selectedUser.interests,
                  pronouns: selectedUser.pronouns,
                  birthday: selectedUser.birthday,
                  school: selectedUser.school,
                }}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditUserModal;
