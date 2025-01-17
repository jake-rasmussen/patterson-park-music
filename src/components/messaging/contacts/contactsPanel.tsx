import { Button } from "@nextui-org/button";
import { Divider, Skeleton, Spinner } from "@nextui-org/react";
import { Enrollment, Family, User, USER_TYPE } from "@prisma/client";
import { IconSchool, IconUser, IconApple, IconArrowBack } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import { api } from "~/utils/api";
import { capitalizeToUppercase } from "~/utils/helper";
import ParentInfo from "./parentInfo";
import StudentInfo from "./studentInfo";
import TeacherInfo from "./teacherInfo";

type PropType = {
  users: (User & {
    family: Family | null
  })[];
  isLoading: boolean;
  selectedUser?: (User & {
    family: Family | null
  });
  setSelectedUser: Dispatch<SetStateAction<(User & {
    family: Family | null
  }) | undefined>>;
}

const ContactsPanel = (props: PropType) => {
  const {
    users,
    isLoading,
    selectedUser,
    setSelectedUser
  } = props;

  return (
    <div className="h-full overflow-hidden">
      {
        isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner label="Loading..." className="m-auto" />
          </div>
        ) : (
          <>
            {
              selectedUser ? (
                <div className="flex flex-col gap-2 items-center m-2">
                  <div className="w-full">
                    <Button
                      isIconOnly
                      variant="light"
                      onClick={() => {
                        setSelectedUser(undefined);
                      }}
                    >
                      <IconArrowBack />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 w-full text-center items-center px-2">
                    <div className="flex flex-row gap-2 justify-center items-center">
                      {selectedUser.type === USER_TYPE.STUDENT ? (
                        <IconSchool className="rounded-full h-full w-auto" />
                      ) : selectedUser.type === USER_TYPE.PARENT ? (
                        <IconUser className="rounded-full h-full w-auto" />
                      ) : (
                        <IconApple />
                      )}
                      <h2 className="text-xl">{selectedUser.firstName} {selectedUser.lastName}</h2>
                    </div>

                    <Divider />

                    {
                      (selectedUser.type === USER_TYPE.PARENT || selectedUser.type === USER_TYPE.STUDENT) ? (
                        <div className="flex flex-col gap-8 w-full">
                          <div className="flex flex-row gap-4 justify-center items-center">
                            <span>{selectedUser.family?.campus}</span>
                            <Divider orientation="vertical" className="h-8" />
                            <span>{selectedUser.family?.doorCode}</span>
                          </div>

                          {selectedUser.type === USER_TYPE.PARENT && (
                            <ParentInfo users={users} selectedUser={selectedUser} />
                          )}

                          {selectedUser.type === USER_TYPE.STUDENT && (
                            <StudentInfo users={users} selectedUser={selectedUser} />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col pt-8 w-full">
                          {
                            selectedUser.type === USER_TYPE.TEACHER && (
                              <TeacherInfo selectedUser={selectedUser} />
                            )
                          }
                        </div>
                      )
                    }
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 items-center m-2">
                  {(users || []).map((user: (User & {
                    family: Family | null
                  })) => (
                    <Button
                      className="w-full h-full min-h-[4rem] min-w-[8rem] py-4 flex justify-start"
                      onPress={() => setSelectedUser(user)}
                      variant="light"
                      key={user.phoneNumber}
                    >
                      <div className="flex flex-row h-full items-center gap-2">
                        {user.type === USER_TYPE.STUDENT ? <IconSchool className="rounded-full h-full w-auto" /> :
                          user.type === USER_TYPE.PARENT ? <IconUser className="rounded-full h-full w-auto" /> :
                            <IconApple />
                        }

                        <div className="flex flex-col items-start text-black">
                          <span className="text-small">{user.firstName}</span>
                          <span className="text-tiny text-default-500">{user.lastName}</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )
            }
          </>
        )
      }
    </div>
  )

}

export default ContactsPanel;