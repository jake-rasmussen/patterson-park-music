import { Divider } from "@nextui-org/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { Family, User } from "@prisma/client";
import Error from "next/error";
import EmailPanel from "~/components/messaging/email/emailPanel";
import SMSPanel from "~/components/messaging/sms/smsPanel";
import ContactsPanel from "~/components/messaging/contacts/contactsPanel";
import Layout from "~/layouts/layout";

const MessagePage = () => {
  const [selectedUser, setSelectedUser] = useState<(User & {
    family: Family | null
  })>();

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
        <section className="w-80 overflow-y-auto h-full">
          <ContactsPanel
            isLoading={isLoading}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            users={users || []}
          />
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
                <EmailPanel selectedUser={selectedUser} />
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

MessagePage.getLayout = (page: React.ReactElement, isAuthenticated: boolean) => (
  <Layout>{page}</Layout>
);

export default MessagePage;