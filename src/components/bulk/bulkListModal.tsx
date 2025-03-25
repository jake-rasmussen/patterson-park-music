import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Divider,
  Spinner,
  ModalBody,
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  PressEvent,
} from "@heroui/react";
import { USER_TYPE, ENROLLMENT_STATUS, CAMPUS, COURSE, SEMESTER, WEEKDAY, User, Family, Enrollment } from "@prisma/client";
import { api } from "~/utils/api";
import UserTable from "./bulkMessageTable";
import toast from "react-hot-toast";

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
    teacherId: string[];
  };
  type: "email" | "sms";
  subject?: string;
  message: string;
  attachedFiles: File[];
  allUsers: (User & {
    family: Family | null;
    enrollment: Enrollment[];
  })[];
};

const BulkListModal = (props: PropType) => {
  const { isOpen, onOpenChange, filters, type, subject, message, attachedFiles, allUsers } = props;

  const [selectedUsers, setSelectedUsers] = useState<(User & {
    family: Family | null;
    enrollment: Enrollment[];
  })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: users, isLoading, refetch } = api.bulk.getFilteredUsers.useQuery(filters, {
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const sendEmail = api.email.sendEmail.useMutation();
  const sendSMS = api.sms.sendSMS.useMutation();

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    if (isOpen && users) {
      if (selectedUsers.length === 0) {
        setSelectedUsers(users);
      }
    }
  }, [isOpen, users]);

  const addUser = (user: any, e?: PressEvent) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const sendMessages = async () => {
    setIsSending(true);
    try {
      const promises = selectedUsers.map(async (user: (User & {
        family: Family | null;
        enrollment: Enrollment[];
      })) => {
        const processedMessage = message
          .replace(/\[First Name\]/g, user.firstName)
          .replace(/\[Last Name\]/g, user.lastName)
          .replace(/\[Family Name\]/g, user.family ? user.family.familyName : "N/A")
          .replace(/\[Door Code\]/g, user.family ? user.family.doorCode : "N/A");
        if (type === "email" && user.email) {
          return sendEmail.mutateAsync({
            to: user.email,
            subject: subject || "No Subject",
            body: processedMessage,
            attachments: attachedFiles.map((file) => ({
              filename: file.name,
              type: file.type,
              content: "",
              url: URL.createObjectURL(file),
            })),
          });
        } else if (type === "sms") {
          return sendSMS.mutateAsync({
            to: user.phoneNumber,
            message: processedMessage,
            mediaUrls: attachedFiles.map((file) => URL.createObjectURL(file)),
          });
        }
      });

      await Promise.all(promises);
      toast.success(`${type === "email" ? "Emails" : "SMS"} sent successfully!`);
      onOpenChange(); // Close modal after sending
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error("Failed to send messages.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers =
    allUsers?.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedUsers.some((u) => u.id === user.id)
    ) || [];

  const teachers = filteredUsers?.filter((user) => user.type === USER_TYPE.TEACHER) ?? [];
  const students = filteredUsers?.filter((user) => user.type === USER_TYPE.STUDENT) ?? [];
  const parents = filteredUsers?.filter((user) => user.type === USER_TYPE.PARENT) ?? [];

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Create Bulk Message</ModalHeader>
            <ModalBody className="overflow-y-scroll">
              {isLoading ? (
                <div className="w-full h-full flex justify-center items-center py-10">
                  <Spinner size="sm" color="primary" label="Loading..." />
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">Selected Users</h3>
                  <UserTable
                    users={selectedUsers}
                    onRemoveUser={removeUser}
                    message={message}
                    subject={subject}
                    type={type}
                    attachedFiles={attachedFiles}
                  />

                  <Divider className="my-2" />

                  <h3 className="text-lg font-semibold">Search and Add Users</h3>
                  <Autocomplete
                    value={searchQuery}
                    onInputChange={setSearchQuery}
                    placeholder="Search users by name"
                    className="max-w-xs mb-4"
                    selectedKey={null}
                  >
                    {students.length > 0 ? (
                      <AutocompleteSection title="Students" showDivider>
                        {students.map((user) => (
                          <AutocompleteItem key={user.id} onPress={(e) => addUser(user, e)}>
                            {`${user.firstName} ${user.lastName}`}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                    ) : <></>}

                    {parents.length > 0 ? (
                      <AutocompleteSection title="Parents" showDivider>
                        {parents.map((user) => (
                          <AutocompleteItem key={user.id} onPress={() => addUser(user)}>
                            {`${user.firstName} ${user.lastName}`}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                    ) : <></>}

                    {teachers.length > 0 ? (
                      <AutocompleteSection title="Teachers">
                        {teachers.map((user) => (
                          <AutocompleteItem key={user.id} onPress={() => addUser(user)}>
                            {`${user.firstName} ${user.lastName}`}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                    ) : <></>}
                  </Autocomplete>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} color="danger" variant="light">
                Close
              </Button>
              <Button
                onPress={sendMessages}
                color="primary"
                isLoading={isSending}
                isDisabled={isSending || selectedUsers.length === 0}
              >
                {isSending ? "Sending..." : "Send"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BulkListModal;
