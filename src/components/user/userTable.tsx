import { Button } from "@nextui-org/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@nextui-org/react";
import { Family, User, USER_TYPE } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import EditUserModal from "./editUserModal";
import { api } from "~/utils/api";

type PropType = {
  users: (User & {
    family: Family | null
  })[];
  type: USER_TYPE;
  select?: boolean;
  onSelectionChange?: (selectedUsers: User[]) => void; // Callback for selection change with User objects
};

const UserTable = (props: PropType) => {
  const { users, type, select = false, onSelectionChange } = props;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { teachers, students, parents } = useMemo(() => {
    if (users) {
      const teachers = users.filter((user) => user.type === USER_TYPE.TEACHER);
      const students = users.filter((user) => user.type === USER_TYPE.STUDENT);
      const parents = users.filter((user) => user.type === USER_TYPE.PARENT);

      return { teachers, students, parents };
    } else {
      return {};
    }
  }, [users]);

  const [selectedUser, setSelectedUser] = useState<(User & {
    family: Family | null
  })>();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!select) {
      setSelectedKeys(new Set());
      setSelectedUser(undefined);
    }
  }, [select]);

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

    const selectedIds = new Set(Array.from(keys).map(String)); // Convert keys to strings
    setSelectedKeys(selectedIds);

    if (onSelectionChange) {
      const selectedUsers = users.filter((user) => selectedIds.has(user.id)); // Map selected IDs to User objects
      onSelectionChange(selectedUsers);
    }
  };

  return (
    <>
      <Table
        selectionMode={select && type !== USER_TYPE.TEACHER ? "multiple" : "none"}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange} // Use the handler
      >
        <TableHeader>
          <TableColumn>FIRST NAME</TableColumn>
          <TableColumn>LAST NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>PHONE NUMBER</TableColumn>
          {!select ? <TableColumn className="text-end">ACTIONS</TableColumn> : <TableColumn><></></TableColumn>}
        </TableHeader>
        <TableBody emptyContent={"No rows to display."}>
          {(
            (type === USER_TYPE.STUDENT ? students :
              type === USER_TYPE.PARENT ? parents :
                teachers) || []
          ).map((user: User & {
            family: Family | null
          }) => (
            <TableRow key={user.id} className="h-16">
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber.substring(2)}</TableCell>
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
                          onOpen();
                        }}
                      >
                        Edit User
                      </DropdownItem>
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
                <TableCell><></></TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUser && (
        <EditUserModal
          selectedUser={selectedUser}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          type={selectedUser.type}
          setSelectedUser={setSelectedUser}
        />
      )}
    </>
  );
};

export default UserTable;
