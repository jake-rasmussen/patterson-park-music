import { Button } from "@heroui/button";
import { Divider, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import { Section, User } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconPlus, IconSchool, IconTrash } from "@tabler/icons-react";
import { enumToStr, joinEnums, formatTime } from "~/utils/helper";
import EditSectionModal from "./editSectionModal";
import { useState } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import EnrollStudents from "./enrollment/enrollStudents";
import CreateSectionModal from "./createSectionModal";

type PropType = {
  sections: (Section & {
    teacher: User
  })[];
  teachers: User[];
  isLoading: boolean;
}

const ManageSections = (props: PropType) => {
  const {
    sections,
    teachers,
    isLoading
  } = props;

  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onOpenChange: onOpenChangeCreate } = useDisclosure();

  const [selectedSection, setSelectedSection] = useState<Section>();

  const utils = api.useUtils();

  const deleteSection = api.section.deleteSection.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully deleted section!");

      utils.section.getAllSections.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  return (
    <section className="flex flex-col gap-8 p-8 h-full">
      <h2 className="text-xl text-center">Section List</h2>
      <Divider />
      <div className="h-full">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner label="Loading..." className="m-auto" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="grow flex justify-end gap-4">
              <Button color="primary" endContent={<IconPlus />} onPress={onOpenChangeCreate}>
                Create New
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableColumn>COURSE</TableColumn>
                <TableColumn>TEACHER</TableColumn>
                <TableColumn>SEMESTER(S)</TableColumn>
                <TableColumn>DAY(S)</TableColumn>
                <TableColumn>START TIME</TableColumn>
                <TableColumn className="text-end">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"No rows to display."}>
                {(sections || []).map((section: (Section & {
                  teacher: User
                }), index: number) => (
                  <TableRow key={index}>
                    <TableCell>{enumToStr(section.course)}</TableCell>
                    <TableCell>{section.teacher.firstName} {section.teacher.lastName}</TableCell>
                    <TableCell>{joinEnums(section.semesters)}</TableCell>
                    <TableCell>{joinEnums(section.weekdays)}</TableCell>
                    <TableCell>{formatTime(section.startTime)}</TableCell>
                    <TableCell className="flex justify-end">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly className="my-auto hover:cursor-pointer" variant="light">
                            <IconDotsVertical />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="add-students"
                            startContent={<IconSchool />}
                            onPress={() => {
                              setSelectedSection(section);
                              onOpenCreate();
                            }}
                          >
                            Enroll Student(s)
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<IconEdit />}
                            onPress={() => {
                              setSelectedSection(section);
                              onOpenEdit();
                            }}
                          >
                            Edit Section
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<IconTrash />}
                            onPress={() => {
                              toast.loading("Deleting section...");
                              deleteSection.mutate({
                                id: section.id
                              });
                            }}
                          >
                            Delete Section
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>


      <CreateSectionModal
        isOpen={isOpenCreate}
        onOpenChange={onOpenChangeCreate}
        teachers={teachers}
      />

      {
        selectedSection && (
          <>
            <EditSectionModal
              selectedSection={selectedSection}
              isOpen={isOpenEdit}
              onOpenChange={onOpenChangeEdit}
              teachers={teachers}
            />
            <EnrollStudents
              sectionId={selectedSection.id}
              isOpen={isOpenCreate}
              onOpenChange={onOpenChangeCreate}
            />
          </>
        )
      }
    </section>
  );
}

export default ManageSections;