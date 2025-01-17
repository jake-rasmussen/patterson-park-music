import { Modal, ModalHeader, ModalBody, ModalFooter, Button, ModalContent } from "@nextui-org/react";
import { Section, User } from "@prisma/client";
import SectionForm from "./sectionForm";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

type PropType = {
  selectedSection: Section;
  isOpen: boolean;
  onOpenChange: () => void;
  teachers: User[];
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
  
    // Parse the time input (assumes `values.startTime` is in "HH:mm" format)
    const [hours, minutes] = values.startTime.split(":").map(Number);
  
    // Construct a UTC Date
    const currentDate = new Date();
    const utcDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        hours,
        minutes
      )
    );
  
    console.log("UTC Date:", utcDate.toISOString());
  
    try {
      await updateSection.mutateAsync({
        id: selectedSection.id,
        course: values.course,
        semesters: values.semesters,
        weekdays: values.weekdays,
        startTime: utcDate, // Send UTC time to the backend
      });
  
      toast.dismiss();
      toast.success("Section updated!");
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Error updating section...");
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
                  startTime: new Date(selectedSection.startTime)
                    .toISOString() // Convert to ISO string (UTC)
                    .slice(11, 16), // Extract "HH:mm" part
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