import { Button } from "@nextui-org/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@nextui-org/react";
import { User } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";
import EditUser from "./editUser";
import { api } from "~/utils/api";

type PropType = {
  users: User[];
  select?: boolean;
  onSelectionChange?: (selectedUsers: User[]) => void; // Callback for selection change with User objects
};

const UserTable = (props: PropType) => {
  const { users, select = false, onSelectionChange } = props;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<User>();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const utils = api.useUtils();

  const deleteUser = api.user.deleteUser.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully deleted user!");

      utils.section.getAllSections.invalidate();
    },
    onError: () => {
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
        selectionMode={select ? "multiple" : "none"}
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
          {users.map((user: User) => (
            <TableRow key={user.id}>
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
        <EditUser
          selectedUser={selectedUser}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isTeacher={selectedUser.isTeacher}
        />
      )}
    </>
  );
};

export default UserTable;
