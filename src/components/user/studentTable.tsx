import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  useDisclosure
} from "@heroui/react";
import { Enrollment, Family, User, USER_TYPE } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconSchool, IconTrash } from "@tabler/icons-react";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import EditUserModal from "./editUserModal";
import { api } from "~/utils/api";
import { enumToStr } from "~/utils/helper";
import EnrollmentDropdown from "../enrollment/enrollmentDropdown";
import ManageStudentEnrollmentsModal from "../enrollment/manageEnrollmentsModal";

type PropType = {
  users: (User & {
    family: Family | null;
    enrollment: Enrollment[];
  })[];
};

const StudentTable = (props: PropType) => {
  const { users } = props;

  const {
    isOpen: isOpenEditUser,
    onOpen: onOpenEditUser,
    onOpenChange: onOpenChangeEditUser
  } = useDisclosure();

  const {
    isOpen: isOpenEnrollStudent,
    onOpen: onOpenEnrollStudent,
    onOpenChange: onOpenChangeEnrollStudent
  } = useDisclosure();

  const students = users?.filter((user) => user.type === USER_TYPE.STUDENT) ?? [];

  const [selectedUser, setSelectedUser] = useState<User & { family: Family | null; enrollment: Enrollment[] }>();

  useEffect(() => {
    if (users && selectedUser) {
      setSelectedUser(users.find((user) => user.id === selectedUser.id));
    }
  }, [users]);

  const utils = api.useUtils();

  const deleteUser = api.user.deleteUser.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully deleted user!");
      utils.section.getAllSections.invalidate();
      utils.user.getAllStudents.invalidate();
      utils.user.getAllUsers.invalidate();
    },
    onError: () => {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 15;
  const totalPages = Math.ceil(students.length / rowsPerPage);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return students.slice(start, end);
  }, [page, students]);

  return (
    <>
      <Table
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={totalPages}
              onChange={(newPage) => setPage(newPage)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>FIRST NAME</TableColumn>
          <TableColumn>LAST NAME</TableColumn>
          <TableColumn>INTERESTS</TableColumn>
          <TableColumn>PRONOUNS</TableColumn>
          <TableColumn>BIRTHDAY</TableColumn>
          <TableColumn>CAMPUS</TableColumn>
          <TableColumn>ENROLLMENTS</TableColumn>
          <TableColumn className="text-end">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No rows to display."}>
          {paginatedStudents.map((user: User & { family: Family | null; enrollment: Enrollment[] }) => (
            <TableRow key={user.id} className="h-16">
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.interests?.map(enumToStr).join(", ") || "-"}</TableCell>
              <TableCell>{user.pronouns || "-"}</TableCell>
              <TableCell>{user.birthday ? new Date(user.birthday).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{user.school || "-"}</TableCell>
              <TableCell>
                <EnrollmentDropdown enrollments={user.enrollment} />
              </TableCell>
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
                        setSelectedUser(user);
                        onOpenEditUser();
                      }}
                    >
                      Edit User
                    </DropdownItem>
                    <DropdownItem
                      key="enroll"
                      startContent={<IconSchool />}
                      onClick={() => {
                        setSelectedUser(user);
                        onOpenEnrollStudent();
                      }}
                    >
                      Manage Enrollments
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<IconTrash />}
                      onClick={() => {
                        toast.loading("Deleting section...");
                        deleteUser.mutate({ id: user.id });
                      }}
                    >
                      Delete User
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUser && (
        <>
          <EditUserModal
            selectedUser={selectedUser}
            isOpen={isOpenEditUser}
            onOpenChange={onOpenChangeEditUser}
            type={selectedUser.type}
            setSelectedUser={setSelectedUser}
          />
          <ManageStudentEnrollmentsModal
            selectedUser={selectedUser}
            isOpen={isOpenEnrollStudent}
            onOpenChange={onOpenChangeEnrollStudent}
            type={USER_TYPE.STUDENT}
            setSelectedUser={setSelectedUser}
          />
        </>
      )}
    </>
  );
};

export default StudentTable;
