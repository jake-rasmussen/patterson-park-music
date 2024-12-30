import { Modal, ModalHeader, ModalBody, ModalFooter, Button, ModalContent } from "@nextui-org/react";
import { Section, User } from "@prisma/client";
import SectionForm from "./sectionForm";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

type PropType = {
  selectedSection: Section;
  isOpen: boolean;
  onOpenChange: () => void;
  teachers: User[]
};

const EditSection = (props: PropType) => {
  const { selectedSection, isOpen, onOpenChange, teachers } = props;

  const utils = api.useUtils();

  const updateSection = api.section.updateSection.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Updated section!");
      utils.section.getAllSections.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Updating section...");

    const currentDate = new Date();
    const [hours, minutes] = values.startTime.split(":").map(Number);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes);

    try {
      await updateSection.mutateAsync({
        id: selectedSection.id,
        course: values.course,
        semesters: values.semesters,
        weekdays: values.weekdays,
        startTime: date,
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
            <ModalHeader>Edit Section</ModalHeader>
            <ModalBody>
              <SectionForm
                handleSubmit={handleSubmit}
                onClose={onClose}
                initialValues={{
                  teacherId: selectedSection.teacherId,
                  course: selectedSection.course,
                  semesters: selectedSection.semesters,
                  weekdays: selectedSection.weekdays,
                  startTime: selectedSection.startTime.toISOString().slice(11, 16), // Convert to HH:MM format
                }}
                teachers={teachers}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditSection;
