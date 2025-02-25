import toast from "react-hot-toast";
import { api } from "~/utils/api";
import SectionForm from "./sectionForm";
import { User } from "@prisma/client";
import { Modal, ModalHeader, ModalBody, ModalContent } from "@heroui/react";

type PropType = {
  isOpen: boolean;
  onOpenChange: () => void;
  teachers: User[];
}

const CreateSectionModal = (props: PropType) => {
  const { isOpen, onOpenChange, teachers } = props;

  const utils = api.useUtils();

  const createSection = api.section.createSection.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Created Section!");

      utils.section.getAllSections.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Creating section...");

    const currentDate = new Date();
    const [hours, minutes] = values.startTime.split(":").map(Number);
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hours,
      minutes
    );

    try {
      await createSection.mutateAsync({
        teacherId: values.teacherId,
        course: values.course,
        semesters: values.semesters,
        weekdays: values.weekdays,
        campus: values.campus,
        startTime: date,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Create Section</ModalHeader>
            <ModalBody>
              <SectionForm
                handleSubmit={handleSubmit}
                teachers={teachers}
                onClose={onClose}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );

}

export default CreateSectionModal;