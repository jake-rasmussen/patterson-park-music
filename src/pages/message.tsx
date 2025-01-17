import { Button, Divider, Skeleton, Spinner } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { User, USER_TYPE } from "@prisma/client";
import { IconApple, IconSchool, IconUser } from "@tabler/icons-react";
import Error from "next/error";
import EmailPanel from "~/components/messaging/email/emailPanel";
import SMSPanel from "~/components/messaging/sms/smsPanel";

export default function MessagePage() {
  const [selectedUser, setSelectedUser] = useState<User>();

  const { data: users, isLoading, error } = api.user.getAllUsers.useQuery({
    skip: 0,
    take: 20,
  });

  if (error) {
    return <Error
      statusCode={
        error?.data?.httpStatus ||
        500
      }
    />
  } else {
    return (
      <main className="flex flex-row w-full h-full bg-white rounded-2xl">
        <section className="w-60 overflow-y-auto">
          {
            isLoading ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spinner label="Loading..." className="m-auto" />
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center m-2">
                {(users || []).map((user: User) => (
                  <Button
                    className="w-full h-full min-h-[4rem] min-w-[8rem] py-4 flex justify-start"
                    onPress={() => setSelectedUser(user)}
                    variant={user === selectedUser ? "solid" : "light"}
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
        </section>

        <Divider orientation="vertical" />

        <section className="flex flex-col w-full h-full min-h-0">
          <div className="w-full flex flex-row items-center text-center min-h-10">
            <div className="w-1/2">Text</div>
            <div className="w-1/2">Email</div>
          </div>

          <Divider />

          {selectedUser ? (
            <div className="flex flex-row h-full min-h-0">

              <div className="w-1/2 flex flex-col h-full">
                <SMSPanel selectedUser={selectedUser} />
              </div>

              <Divider orientation="vertical" />

              <div className="w-1/2 flex flex-col h-full">
                <EmailPanel selectedContact={selectedUser} />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <h1 className="text-xl">Select a user to view conversation</h1>
            </div>
          )}
        </section>
      </main>
    );
  }
}