import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalContent, ModalFooter, Button, Divider, Spinner, ModalBody } from "@heroui/react";
import { USER_TYPE, ENROLLMENT_STATUS, CAMPUS, COURSE, SEMESTER, WEEKDAY } from "@prisma/client";
import { api } from "~/utils/api";
import UserTable from "../user/userTable";

type PropType = {
  isOpen: boolean;
  onOpenChange: () => void;
  filters: {
    userType: USER_TYPE[];
    enrollmentStatus: ENROLLMENT_STATUS[];
    location: CAMPUS[];
    semester: SEMESTER[];
    course: COURSE[];
    weekday: WEEKDAY[];
  };
};

const BulkListModal = ({ isOpen, onOpenChange, filters }: PropType) => {
  const { data: users, isLoading, refetch } = api.bulk.getFilteredUsers.useQuery(filters, {
    enabled: false, // Disable automatic fetching
    staleTime: 0, // Always consider data as stale
    refetchOnMount: true, // Always fetch fresh data when component mounts
    refetchOnWindowFocus: false, // Prevent background refetching
    refetchInterval: false, // Disable periodic refetching
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" className="h-[50vh]">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Message Users</ModalHeader>
            <ModalBody>
              {
                isLoading ? (
                  <div className="w-full h-full flex justify-center items-center py-2">
                    <Spinner size="sm" color="primary" label="Loading..." />
                  </div>
                ) : (
                  <UserTable users={users || []} />
                )
              }
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} color="danger" variant="light">Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BulkListModal;