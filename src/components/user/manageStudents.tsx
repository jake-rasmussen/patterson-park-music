import { Family, User } from "@prisma/client";
import { useDisclosure } from "@nextui-org/modal";
import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Divider, Spinner } from "@nextui-org/react";
import StudentTable from "./studentTable";

type PropType = {
  users: (User & {
    family: Family | null
  })[];
  isLoading: boolean;
}

const ManageStudents = (props: PropType) => {
  const { users, isLoading } = props;

  const [select, setSelect] = useState<boolean>();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleSelection = (newSelectedUsers: User[]) => {
    setSelectedUsers((prevSelectedUsers) => {
      const selectedIds = newSelectedUsers.map((user) => user.id);

      const remainingUsers = prevSelectedUsers.filter((user) =>
        selectedIds.includes(user.id)
      );

      const userMap = new Map(remainingUsers.map((user) => [user.id, user]));
      newSelectedUsers.forEach((user) => userMap.set(user.id, user));

      return Array.from(userMap.values());
    });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl text-center">Student Roster</h2>
      <Divider />
      <div className="h-full">
        {
          isLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner label="Loading..." className="m-auto" />
            </div>
          ) : (
            <div className="flex flex-col gap-8 items-center w-full justify-center">
              <div className="w-full flex flex-col gap-4">
                <StudentTable
                  users={users}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

export default ManageStudents;