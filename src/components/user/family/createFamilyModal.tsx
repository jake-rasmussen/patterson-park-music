import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import FamilyForm from "./familyForm";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { User } from "@prisma/client";
import { SetStateAction } from "react";

type PropType = {
  users: User[];
  selectedUsers: User[];
  isOpen: boolean;
  onOpenChange: () => void;
  setSelect?: (value: SetStateAction<boolean | undefined>) => void;
  setSelectedUsers?: (value: SetStateAction<User[]>) => void;
};

const CreateFamilyModal = (props: PropType) => {
  const { selectedUsers, users, isOpen, onOpenChange, setSelect, setSelectedUsers } = props;

  const utils = api.useUtils();

  const createFamily = api.family.createFamily.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully created family!");

      utils.user.getAllUsers.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error creating family...");
    },
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Creating family...");

    try {
      await createFamily.mutateAsync({
        familyName: values.familyName,
        campus: values.campus,
        doorCode: values.doorCode,
        userIds: values.userIds,
      });

      setSelect?.(false);
      setSelectedUsers?.([]);

      toast.dismiss();
      toast.success("Family created successfully!");
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Failed to create family.");
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create Family</ModalHeader>
              <ModalBody>
                <FamilyForm
                  handleSubmit={async (values) => {
                    await handleSubmit(values);
                    onClose();
                  }}
                  users={users}
                  selectedUserIds={selectedUsers.map((user) => user.id)}
                  onClose={onClose}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateFamilyModal;
