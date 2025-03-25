import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import { Enrollment, Family, User, USER_TYPE } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconSchool, IconTrash } from "@tabler/icons-react";
import { useState, useEffect } from "react";
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
  onSelectionChange?: (selectedUsers: User[]) => void; // Callback for selection change with User objects
  editable?: boolean;
  displayEnrollment?: boolean;
};

const UserTable = (props: PropType) => {
  const { users, select = false, onSelectionChange, editable = false, displayEnrollment } = props;

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

  const [selectedUser, setSelectedUser] = useState<(User & {
    family: Family | null;
    enrollment: Enrollment[];
  })>();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!select) {
      setSelectedKeys(new Set());
      setSelectedUser(undefined);
    }
  }, [select]);

  useEffect(() => {
    if (users && selectedUser) {
      setSelectedUser(users.find((user) => user.id === selectedUser.id)); // Make sure data is updated
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
      >
        <TableHeader>
          <TableColumn>FIRST NAME</TableColumn>
          <TableColumn>LAST NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>PHONE NUMBER</TableColumn>
          {displayEnrollment ? <TableColumn>ENROLLMENTS</TableColumn> : <TableColumn><></></TableColumn>}
          {!select && editable ? <TableColumn className="text-end">ACTIONS</TableColumn> : <TableColumn><></></TableColumn>}
        </TableHeader>
        <TableBody emptyContent={"No rows to display."}>
          {(users).map((user: User & {
            family: Family | null;
            enrollment: Enrollment[];
          }) => (
            <TableRow key={user.id} className="h-16">
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber ? user.phoneNumber.substring(2) : "-"}</TableCell>
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
                      {
                        displayEnrollment ? (
                          <DropdownItem
                            key="enroll"
                            startContent={<IconSchool />}
                            onPress={() => {
                              setSelectedUser(user);
                              onOpenEnrollStudent();
                            }}
                          >
                            Manage Enrollments
                          </DropdownItem>
                        ) : <></>
                      }
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<IconTrash />}
                        onClick={() => {
                          toast.loading("Deleting section...");
                          deleteUser.mutate({
                            id: user.id,
                          });
                        }}
                      >
                        Delete User
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              ) : (
                <TableCell>
                  <></>
                </TableCell>
              )}
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

export default UserTable;
