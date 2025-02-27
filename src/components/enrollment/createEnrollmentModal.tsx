import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { Section, User } from "@prisma/client";
import EnrollmentForm from "./enrollmentForm";

type PropType = {
  isOpen: boolean;
  onOpenChange: () => void;
  sections: (Section & { teacher: User })[];
  userId: string;
};

const CreateEnrollmentModal = ({ isOpen, onOpenChange, sections, userId }: PropType) => {
  const utils = api.useUtils();

  const createEnrollment = api.enrollment.createEnrollment.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully created enrollment!");

      utils.enrollment.getAllEnrollments.invalidate();
      utils.user.getAllUsers.invalidate();
      utils.user.getAllStudents.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Creating enrollment...");

    await createEnrollment.mutateAsync({
      userId,
      sectionId: values.sectionId,
      startDate: values.dateRange.start,
      endDate: values.dateRange.end,
      status: values.status,
    });

    onOpenChange();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Create Enrollment</ModalHeader>
            <ModalBody>
              <EnrollmentForm
                handleSubmit={async (values) => {
                  await handleSubmit(values);
                  onClose();
                }}
                onClose={onClose}
                sections={sections}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateEnrollmentModal;
