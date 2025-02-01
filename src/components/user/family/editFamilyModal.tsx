import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import { Family, User } from "@prisma/client";
import { api } from "~/utils/api";
import FamilyForm from "./familyForm";
import toast from "react-hot-toast";

type PropType = {
  selectedFamily: (Family & {
    users: User[]
  });
  users: (User & {
    family: Family | null
  })[]
  isOpen: boolean;
  onOpenChange: () => void;
}

const EditFamilyModal = (props: PropType) => {
  const {
    selectedFamily,
    users,
    isOpen,
    onOpenChange,
  } = props;

  const utils = api.useUtils();

  const { mutateAsync: updateFamily } = api.family.updateFamily.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully updated family!");

      onOpenChange();
      utils.family.getAllFamilies.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    }
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Updating family...");

    await updateFamily({
      id: selectedFamily.id,
      familyName: values.familyName,
      campus: values.campus,
      doorCode: values.doorCode,
      userIds: values.userIds,
    });

    utils.family.getAllFamilies.invalidate();
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Edit Family</ModalHeader>
            <ModalBody>
              <FamilyForm
                handleSubmit={handleSubmit}
                users={users}
                onClose={onClose}
                selectedUserIds={selectedFamily.users.map((user) => user.id)}
                initialValues={{
                  familyName: selectedFamily.familyName,
                  campus: selectedFamily.campus,
                  doorCode: selectedFamily.doorCode
                }}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default EditFamilyModal;