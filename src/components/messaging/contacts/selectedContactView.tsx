import { Button } from "@heroui/button";
import { Divider, useDisclosure } from "@heroui/react";
import { $Enums, Enrollment, Family, User, USER_TYPE } from "@prisma/client";
import { IconArrowBack, IconEdit } from "@tabler/icons-react";
import ParentInfo from "./info/parentInfo";
import StudentInfo from "./info/studentInfo";
import TeacherInfo from "./info/teacherInfo";
import { Dispatch, SetStateAction } from "react";
import UserIcon from "~/components/user/userIcon";
import EditUserModal from "~/components/user/editUserModal";

type PropType = {
  users: (User & {
    family: Family | null; 
    enrollment: Enrollment[]
  })[];
  selectedUser: (User & {
    family: Family | null; 
    enrollment: Enrollment[]
  });
  setSelectedUser: Dispatch<SetStateAction<(User & { family: Family | null; enrollment: Enrollment[] }) | undefined>>;
};

const SelectedContactView = (props: PropType) => {
  const { users, selectedUser, setSelectedUser } = props;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="flex flex-col gap-2 items-center m-2">
      <div className="w-full flex flex-row my-4">
        <Button
          isIconOnly
          variant="light"
          onClick={() => setSelectedUser(undefined)}
        >
          <IconArrowBack />
        </Button>

        <div className="grow flex justify-end">
          <Button
            isIconOnly
            variant="light"
            onClick={onOpen}
          >
            <IconEdit />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8 w-full text-center items-center px-2">
        <div className="flex flex-row gap-2 justify-center items-center">
          <UserIcon userType={selectedUser.type} />
          <h2 className="text-lg">
            {selectedUser.firstName} {selectedUser.lastName}
          </h2>
        </div>

        {(selectedUser.type === USER_TYPE.PARENT ||
          selectedUser.type === USER_TYPE.STUDENT) && (
            <div className="flex flex-col gap-8 w-full">
              {
                selectedUser.family && (
                  <div className="flex flex-row gap-4 justify-center items-center">
                    <span>{selectedUser.family?.campus}</span>
                    <Divider orientation="vertical" className="h-8" />
                    <span>{selectedUser.family?.doorCode}</span>
                  </div>
                )
              }

              {selectedUser.type === USER_TYPE.PARENT && (
                <ParentInfo users={users} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
              )}

              {selectedUser.type === USER_TYPE.STUDENT && (
                <StudentInfo users={users} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
              )}
            </div>
          )}

        {selectedUser.type === USER_TYPE.TEACHER && (
          <TeacherInfo selectedUser={selectedUser} />
        )}
      </div>

      <EditUserModal selectedUser={selectedUser} isOpen={isOpen} onOpenChange={onOpenChange} type={selectedUser.type} setSelectedUser={setSelectedUser} />
    </div>
  )

}

export default SelectedContactView;