import { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, useDisclosure } from "@heroui/react";
import { Enrollment, Family, User } from "@prisma/client";
import { IconTrash, IconEye } from "@tabler/icons-react";
import PreviewBulkMessageModal from "./messaging/previewBulkMessageModal";

type PropType = {
  users: (User & {
    family: Family | null;
    enrollment: Enrollment[];
  })[];
  message: string;
  subject?: string;
  type: "sms" | "email";
  onRemoveUser: (userId: string) => void;
  attachedFiles: File[];
};

const UserTable = (props: PropType) => {
  const { users, message, onRemoveUser, subject, type, attachedFiles } = props;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<(User & {
    family: Family | null
  }) | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableColumn>FIRST NAME</TableColumn>
          <TableColumn>LAST NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>PHONE NUMBER</TableColumn>
          <TableColumn>PREVIEW MESSAGE</TableColumn>
          <TableColumn className="text-end">REMOVE</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No rows to display."}>
          {users.map((user: User & { family: Family | null; enrollment: Enrollment[] }) => (
            <TableRow key={user.id} className="h-16">
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber?.substring(2)}</TableCell>
              <TableCell>
                <Button variant="flat" endContent={<IconEye />} onPress={() => {
                  setSelectedUser(user);
                  onOpen();
                }}>
                  View
                </Button>
              </TableCell>
              <TableCell className="flex justify-end items-end">
                <Button
                  isIconOnly
                  startContent={<IconTrash />}
                  color="danger"
                  variant="light"
                  onPress={() => onRemoveUser(user.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUser && (
        <PreviewBulkMessageModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          user={selectedUser}
          message={message}
          subject={subject}
          type={type}
          attachedFiles={attachedFiles}
        />
      )}
    </>
  );
};

export default UserTable;
