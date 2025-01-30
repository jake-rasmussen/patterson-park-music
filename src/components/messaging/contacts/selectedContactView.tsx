import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/react";
import { Family, User, USER_TYPE } from "@prisma/client";
import { IconArrowBack, IconSchool, IconUser, IconApple } from "@tabler/icons-react";
import users from "~/pages/users";
import ParentInfo from "./info/parentInfo";
import StudentInfo from "./info/studentInfo";
import TeacherInfo from "./info/teacherInfo";
import { Dispatch, SetStateAction } from "react";
import UserIcon from "~/components/user/userIcon";

type PropType = {
  users: (User & {
    family: Family | null
  })[];
  selectedUser: (User & {
    family: Family | null
  });
  setSelectedUser: Dispatch<SetStateAction<(User & { family: Family | null }) | undefined>>;
};

const SelectedContactView = (props: PropType) => {
  const { users, selectedUser, setSelectedUser } = props;

  return (
    <div className="flex flex-col gap-2 items-center m-2">
      <div className="w-full">
        <Button
          isIconOnly
          variant="light"
          onClick={() => setSelectedUser(undefined)}
        >
          <IconArrowBack />
        </Button>
      </div>

      <div className="flex flex-col gap-4 w-full text-center items-center px-2">
        <div className="flex flex-row gap-2 justify-center items-center">
          <UserIcon userType={selectedUser.type} />
          <h2 className="text-xl">
            {selectedUser.firstName} {selectedUser.lastName}
          </h2>
        </div>

        <Divider />

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
                <ParentInfo users={users} selectedUser={selectedUser} />
              )}

              {selectedUser.type === USER_TYPE.STUDENT && (
                <StudentInfo users={users} selectedUser={selectedUser} />
              )}
            </div>
          )}

        {selectedUser.type === USER_TYPE.TEACHER && (
          <TeacherInfo selectedUser={selectedUser} />
        )}
      </div>
    </div>
  )

}

export default SelectedContactView;