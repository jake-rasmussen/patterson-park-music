import { Button } from "@nextui-org/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@nextui-org/react";
import { Enrollment, Family, User, USER_TYPE } from "@prisma/client";
import { IconDotsVertical, IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import EditUserModal from "./editUserModal";
import { api } from "~/utils/api";
import { capitalizeToUppercase } from "~/utils/helper";
import EnrollmentDropdown from "../enrollment/enrollmentDropdown";

type PropType = {
  users: (User & {
    family: Family | null;
    enrollment: Enrollment[];
  })[];
};

const UserTable = (props: PropType) => {
  const { users } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const students = useMemo(() => {
    return users?.filter((user) => user.type === USER_TYPE.STUDENT) || [];
  }, [users]);

  const [selectedUser, setSelectedUser] = useState<(User & { family: Family | null; enrollment: Enrollment[] })>();

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

  return (
    <>
      <Table>
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
          {students.map((user: User & { family: Family | null; enrollment: Enrollment[] }) => (
            <TableRow key={user.id} className="h-16">
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.interests?.map(capitalizeToUppercase).join(", ") || "-"}</TableCell>
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
