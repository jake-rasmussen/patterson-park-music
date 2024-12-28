import { Button } from "@nextui-org/button";
import { Divider, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@nextui-org/react";
import { Section, User } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { capitalizeToUppercase, joinEnums, formatTime } from "~/utils/helper";
import EditSection from "./editSection";
import { useState } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

type PropType = {
  sections: (Section & {
    teacher: User
  })[];
  teachers: User[];
  isLoading: boolean;
}

const SectionTable = (props: PropType) => {
  const {
    sections,
    teachers,
    isLoading
  } = props;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedSection, setSelectedSection] = useState<Section>();

  const utils = api.useUtils();

  const deleteSection = api.section.deleteSection.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully deleted section!");

      utils.section.getAllSections.invalidate();
    },
    onError: () => {
      toast.error("Error...");
    },
  })

  return (<>
    <h2 className="text-xl text-center">Section List</h2>
    <Divider />
    <div className="h-full">
      {isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <Spinner label="Loading..." className="m-auto" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 px-20 items-center justify-center">
          <Table aria-label="Example empty table">
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
              }), index: number) =>
                <TableRow key={index}>
                  <TableCell>{capitalizeToUppercase(section.course)}</TableCell>
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
                          key="edit"
                          startContent={<IconEdit />}
                          onClick={() => {
                            setSelectedSection(section);
                            onOpen();
                          }}
                        >
                          Edit Section
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<IconTrash />}
                          onClick={() => {
                            toast.loading("Deleting section...");
                            deleteSection.mutate({
                              id: section.id
                            })
                          }}
                        >
                          Delete Section
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>

    {
      selectedSection && (
        <EditSection
          selectedSection={selectedSection}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          teachers={teachers}
        />
      )
    }
  </>);
}

export default SectionTable;