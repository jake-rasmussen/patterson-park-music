import { Divider } from "@heroui/react";
import { useState } from "react";
import { Enrollment, Family, User } from "@prisma/client";
import EmailPanel from "~/components/messaging/email/emailPanel";
import SMSPanel from "~/components/messaging/sms/smsPanel";
import ContactsPanel from "~/components/messaging/contacts/contactsPanel";
import Layout from "~/layouts/layout";

const MessagePage = () => {
  const [selectedUser, setSelectedUser] = useState<
    User & { family: Family | null; enrollment: Enrollment[] }
  >();

  return (
    <main className="flex flex-row w-full h-full bg-white rounded-2xl overflow-auto">
      <section className="min-w-72 overflow-y-hidden h-full">
        <ContactsPanel
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      </section>

      <Divider orientation="vertical" />

      <section className="flex flex-col w-full h-full min-h-0 min-w-96">
        {selectedUser ? (
          <>
            <div className="w-full flex flex-row items-center text-center min-h-10">
              <div className="w-2/5">Text</div>
              <div className="w-3/5">Email</div>
            </div>
            <Divider />
            <div className="flex flex-row h-full min-h-0">
              <div className="w-2/5 flex flex-col h-full">
                <SMSPanel selectedUser={selectedUser} />
              </div>
              <Divider orientation="vertical" />
              <div className="w-3/5 flex flex-col h-full">
                <EmailPanel selectedUser={selectedUser} />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="text-xl text-center">
              Select a user to view conversation
            </h1>
          </div>
        )}
      </section>
    </main>
  );
};

MessagePage.getLayout = (page: React.ReactElement, isAuthenticated: boolean) => (
  <Layout>{page}</Layout>
);

export default MessagePage;
