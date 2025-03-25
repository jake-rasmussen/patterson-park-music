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
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import EditUserModal from "./editUserModal";
import { api } from "~/utils/api";
import EnrollmentDropdown from "../enrollment/enrollmentDropdown";
import ManageStudentEnrollmentsModal from "../enrollment/manageEnrollmentsModal";

type PropType = {
  users: (User & {
    family: Family | null;
    enrollment: Enrollment[];
  })[];
  select?: boolean;
  onSelectionChange?: (selectedUsers: User[]) => void;
  editable?: boolean;
  displayEnrollment?: boolean;
};

const UserTable = (props: PropType) => {
  const { users, select = false, onSelectionChange, editable = false, displayEnrollment } = props;

  const {
    isOpen: isOpenEditUser,
    onOpen: onOpenEditUser,
    onOpenChange: onOpenChangeEditUser,
  } = useDisclosure();

  const {
    isOpen: isOpenEnrollStudent,
    onOpen: onOpenEnrollStudent,
    onOpenChange: onOpenChangeEnrollStudent,
  } = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<
    User & { family: Family | null; enrollment: Enrollment[] }
  >();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(users.length / rowsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return users.slice(start, end);
  }, [page, users]);

  useEffect(() => {
    if (!select) {
      setSelectedKeys(new Set());
      setSelectedUser(undefined);
    }
  }, [select]);

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

  const handleSelectionChange = (keys: any) => {
    if (keys === "all" || typeof keys === "string") return;

    const selectedIds = new Set(Array.from(keys).map(String));
    setSelectedKeys(selectedIds);

    if (onSelectionChange) {
      const selectedUsers = users.filter((user) => selectedIds.has(user.id));
      onSelectionChange(selectedUsers);
    }
  };

  return (
    <>
      <Table
        selectionMode={select ? "multiple" : "none"}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
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
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>PHONE NUMBER</TableColumn>
          {displayEnrollment ? (
            <TableColumn>ENROLLMENTS</TableColumn>
          ) : (
            <TableColumn><></></TableColumn>
          )}
          {!select && editable ? (
            <TableColumn className="text-end">ACTIONS</TableColumn>
          ) : (
            <TableColumn><></></TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No rows to display."}>
          {paginatedUsers.map(
            (user: User & { family: Family | null; enrollment: Enrollment[] }) => (
              <TableRow key={user.id} className="h-16">
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email ? user.email : "-"}</TableCell>
                <TableCell>
                  {user.phoneNumber ? user.phoneNumber.substring(2) : "-"}
                </TableCell>
                {displayEnrollment ? (
                  <TableCell>
                    <EnrollmentDropdown enrollments={user.enrollment} />
                  </TableCell>
                ) : (
                  <TableCell><></></TableCell>
                )}
                {!select && editable ? (
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
                          onPress={() => {
                            setSelectedUser(user);
                            onOpenEditUser();
                          }}
                        >
                          Edit User
                        </DropdownItem>
                        {displayEnrollment ? <TableColumn>ENROLLMENTS</TableColumn> : <TableColumn><></></TableColumn>}
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<IconTrash />}
                          onPress={() => {
                            toast.loading("Deleting section...");
                            deleteUser.mutate({ id: user.id });
                          }}
                        >
                          Delete User
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                ) : (
                  <TableCell><></></TableCell>
                )}
              </TableRow>
            )
          )}
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

export default UserTable;

