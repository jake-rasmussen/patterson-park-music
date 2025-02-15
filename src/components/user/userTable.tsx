import { Button } from "@nextui-org/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@nextui-org/react";
import { $Enums, Enrollment, Family, User, USER_TYPE } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconSchool, IconTrash } from "@tabler/icons-react";
import { useMemo, useState, useEffect, SetStateAction } from "react";
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
  type: USER_TYPE;
  select?: boolean;
  onSelectionChange?: (selectedUsers: User[]) => void; // Callback for selection change with User objects
};

const UserTable = (props: PropType) => {
  const { users, type, select = false, onSelectionChange } = props;

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

  const teachers = users?.filter((user) => user.type === USER_TYPE.TEACHER) ?? [];
  const students = users?.filter((user) => user.type === USER_TYPE.STUDENT) ?? [];
  const parents = users?.filter((user) => user.type === USER_TYPE.PARENT) ?? [];

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
        selectionMode={select && type !== USER_TYPE.TEACHER ? "multiple" : "none"}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
      >
        <TableHeader>
          <TableColumn>FIRST NAME</TableColumn>
          <TableColumn>LAST NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>PHONE NUMBER</TableColumn>
          {type === USER_TYPE.STUDENT ? <TableColumn>ENROLLMENTS</TableColumn> : <TableColumn><></></TableColumn>}
          {!select ? <TableColumn className="text-end">ACTIONS</TableColumn> : <TableColumn><></></TableColumn>}
        </TableHeader>
        <TableBody emptyContent={"No rows to display."}>
          {(
            (type === USER_TYPE.STUDENT ? students :
              type === USER_TYPE.PARENT ? parents :
                teachers) || []
          ).map((user: User & {
            family: Family | null;
            enrollment: Enrollment[];
          }) => (
            <TableRow key={user.id} className="h-16">
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber.substring(2)}</TableCell>
              {type === USER_TYPE.STUDENT ? (
                <TableCell>
                  <EnrollmentDropdown enrollments={user.enrollment} />
                </TableCell>
              ) : (
                <TableCell><></></TableCell>
              )}
              {!select ? (
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
                      {
                        type === USER_TYPE.STUDENT ? (
                          <DropdownItem
                            key="enroll"
                            startContent={<IconSchool />}
                            onClick={() => {
                              setSelectedUser(user);
                              onOpenEnrollStudent();
                            }}
                          >
                            Edit Enrollments
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
