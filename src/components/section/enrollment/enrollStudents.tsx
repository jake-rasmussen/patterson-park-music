import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import UserTable from "../../user/userTable";
import { api } from "~/utils/api";
import { Button, Spinner } from "@heroui/react";
import { ENROLLMENT_STATUS, User, USER_TYPE } from "@prisma/client";
import { useState } from "react";
import toast from "react-hot-toast";
import EnrollStudentCard from "./enrollStudentCard";

export type EnrollmentData = {
  dateRange: { start: Date; end: Date } | null;
  status: ENROLLMENT_STATUS | undefined;
};

type PropType = {
  sectionId: string;
  isOpen: boolean;
  onOpenChange: () => void;
};

const EnrollStudents = (props: PropType) => {
  const { sectionId, isOpen, onOpenChange } = props;

  const { data: users, isLoading } = api.user.getAllStudents.useQuery();

  const utils = api.useUtils();

  const createEnrollments = api.enrollment.createEnrollments.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Enrollments created successfully!");

      utils.section.getAllSections.invalidate();
      utils.user.getAllStudents.invalidate();

      onOpenChange();
      setPage(0);
      setSelectedUsers([]);
    },
    onError() {
      toast.dismiss();
      toast.success("Error...");
    }
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<Record<string, EnrollmentData | undefined>>({});
  const [page, setPage] = useState<number>(0);

  const handleSelection = (users: User[]) => {
    setSelectedUsers(users);

    const initialData = users.reduce<Record<string, EnrollmentData | undefined>>((map, user) => {
      map[user.id] = {
        dateRange: null,
        status: undefined,
      };
      return map;
    }, {});
    setEnrollmentData((prev) => ({ ...prev, ...initialData }));
  };

  const updateEnrollmentData = (userId: string, data: Partial<EnrollmentData>) => {
    setEnrollmentData((prev) => ({
      ...prev,
      [userId]: {
        dateRange: data.dateRange !== undefined ? data.dateRange : prev[userId]?.dateRange ?? null,
        status: data.status !== undefined ? data.status : prev[userId]?.status ?? undefined,
      },
    }));
  };

  const isFormComplete = () => {
    return selectedUsers.every((user) => {
      const data = enrollmentData[user.id];
      return data?.dateRange !== null && data?.status !== undefined;
    });
  };

  const handleSubmit = async () => {
    toast.loading("Enrolling student(s)");

    const enrollments = selectedUsers.map((user) => {
      const data = enrollmentData[user.id];
      if (!data?.dateRange || !data?.status) {
        return null;
      } else {
        return {
          userId: user.id,
          sectionId: sectionId,
          startDate: data.dateRange.start,
          endDate: data.dateRange.end,
          status: data.status,
        };
      }
    }).filter((enrollment) => !!enrollment);

    await createEnrollments.mutateAsync(enrollments);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Enroll Student(s) to Section</ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="w-full h-full flex justify-center items-center py-20">
                  <Spinner label="Loading..." className="m-auto" />
                </div>
              ) : (
                <>
                  {page === 0 ? (
                    <UserTable
                      users={users || []}
                      select
                      onSelectionChange={handleSelection}
                    />
                  ) : (
                    <>
                      {selectedUsers.map((user: User) => (
                        <EnrollStudentCard
                          key={user.id}
                          user={user}
                          enrollmentData={enrollmentData[user.id]!}
                          updateEnrollmentData={updateEnrollmentData}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onOpenChange}>
                Close
              </Button>
              {page === 0 ? (
                <Button
                  color="primary"
                  onPress={() => setPage(page + 1)}
                  isDisabled={selectedUsers.length === 0}
                >
                  Next
                </Button>
              ) : (
                <>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isDisabled={!isFormComplete()} // Disable if form is incomplete
                  >
                    Submit
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EnrollStudents;
