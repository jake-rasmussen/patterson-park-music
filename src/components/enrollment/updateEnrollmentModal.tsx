import { Modal, ModalHeader, ModalBody, ModalContent } from "@heroui/react";
import { Enrollment, Section, User } from "@prisma/client";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { Dispatch, SetStateAction } from "react";
import EnrollmentForm from "./enrollmentForm";

type PropType = {
  selectedEnrollment: Enrollment;
  isOpen: boolean;
  onOpenChange: () => void;
  sections: (Section & { teacher: User })[];
  setSelectedEnrollment: Dispatch<SetStateAction<Enrollment | undefined>>;
};

const UpdateEnrollmentModal = ({ selectedEnrollment, isOpen, onOpenChange, sections, setSelectedEnrollment }: PropType) => {
  const utils = api.useUtils();

  const updateEnrollment = api.enrollment.updateEnrollment.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully updated enrollment!");

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
    toast.loading("Updating enrollment...");

    try {
      const updatedEnrollment = await updateEnrollment.mutateAsync({
        id: selectedEnrollment.id,
        data: {
          startDate: values.dateRange.start,
          endDate: values.dateRange.end,
          status: values.status,
        },
      });

      setSelectedEnrollment(updatedEnrollment);
    } catch (error) {
      console.error(error);
    }

    onOpenChange();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Enrollment</ModalHeader>
            <ModalBody>
              <EnrollmentForm
                handleSubmit={async (values) => {
                  handleSubmit(values).then(onClose);
                }}
                onClose={onClose}
                sections={sections}
                initialValues={{
                  sectionId: selectedEnrollment.sectionId,
                  dateRange: { start: new Date(selectedEnrollment.startDate), end: new Date(selectedEnrollment.endDate) },
                  status: selectedEnrollment.status,
                }}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateEnrollmentModal;
