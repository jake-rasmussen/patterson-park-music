import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { USER_TYPE, Family, Enrollment, User } from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";
import { enumToStr } from "~/utils/helper";
import { Button, Card, CardBody, CardFooter, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner } from "@heroui/react";
import { api } from "~/utils/api";
import CreateEnrollmentModal from "./createEnrollmentModal";
import UpdateEnrollmentModal from "./updateEnrollmentModal";
import { IconDotsVertical, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import message from "~/pages/message";
import toast from "react-hot-toast";

type PropType = {
  selectedUser: User & { enrollment: Enrollment[] };
  isOpen: boolean;
  onOpenChange: () => void;
  type: USER_TYPE;
  setSelectedUser: Dispatch<SetStateAction<(User & { family: Family | null; enrollment: Enrollment[] }) | undefined>>;
};

const ManageStudentEnrollmentsModal = ({ selectedUser, isOpen, onOpenChange, setSelectedUser }: PropType) => {
  const { data: sections, isLoading } = api.section.getAllSections.useQuery(undefined, {
    staleTime: 0
  });

  const utils = api.useUtils();

  const deleteEnrollment = api.enrollment.deleteEnrollment.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Enrollment deleeted successfully!");

      utils.user.getAllUsers.invalidate();
      utils.user.getAllStudents.invalidate();
      utils.user.getAllUsers.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    }
  })

  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | undefined>();

  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onOpenChange: onOpenChangeCreate } = useDisclosure();

  const formatUTCDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);

  const handleDelete = (enrollment: Enrollment) => {
    toast.loading("Deleting enrollment...");
    deleteEnrollment.mutate(enrollment.id);
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          <ModalHeader>Manage Student Enrollments</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            {isLoading ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spinner label="Loading..." className="m-auto" />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <p>Current Enrollments:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedUser.enrollment.length > 0 ? (
                      selectedUser.enrollment.map((enrollment) => {
                        const section = sections?.find((s) => s.id === enrollment.sectionId);

                        return (
                          <Card key={enrollment.id} className="text-sm w-full col-span-1">
                            <CardBody className="flex flex-row items-center justify-between truncate">
                              <div className="flex flex-col">
                                <span className="font-semibold text-md">
                                  {enumToStr(section?.course || "Unknown Course")} with{" "}
                                  {section?.teacher?.firstName || "Unknown"}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {formatUTCDate(new Date(enrollment.startDate))} →{" "}
                                  {formatUTCDate(new Date(enrollment.endDate))}
                                </span>
                                <span className="text-sm font-semibold text-gray-500">
                                  {enumToStr(enrollment.status)}
                                </span>
                              </div>

                              <Dropdown>
                                <DropdownTrigger>
                                  <Button isIconOnly className="hover:cursor-pointer" variant="light">
                                    <IconDotsVertical />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                  <DropdownItem
                                    key="edit"
                                    startContent={<IconEdit />}
                                    onClick={() => {
                                      setSelectedEnrollment(enrollment);
                                      onOpenEdit();
                                    }}
                                  >
                                    Edit Enrollment
                                  </DropdownItem>
                                  <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<IconTrash />}
                                    onClick={() => {
                                      handleDelete(enrollment);
                                    }}
                                  >
                                    Delete Enrollment
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </CardBody>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="col-span-3 flex justify-center items-center">
                        <p className="text-gray-500">No enrollments found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="primary" endContent={<IconPlus />} onPress={onOpenCreate}>
              Create New
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CreateEnrollmentModal
        isOpen={isOpenCreate}
        onOpenChange={onOpenChangeCreate}
        sections={sections || []}
        userId={selectedUser.id}
      />

      {selectedEnrollment && (
        <UpdateEnrollmentModal
          selectedEnrollment={selectedEnrollment}
          isOpen={isOpenEdit}
          onOpenChange={onOpenChangeEdit}
          sections={sections || []}
          setSelectedEnrollment={setSelectedEnrollment}
        />
      )}
    </>
  );
};

export default ManageStudentEnrollmentsModal;
