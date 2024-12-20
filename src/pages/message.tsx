

import { Button, Divider } from "@nextui-org/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { Contact } from "@prisma/client";
import { IconUser } from "@tabler/icons-react";
import Error from "next/error";
import EmailPanel from "~/components/messaging/email/emailPanel";
import SMSPanel from "~/components/messaging/sms/smsPanel";

export default function Message() {
  const [selectedContact, setSelectedContact] = useState<Contact>();

  const { data: contacts, isLoading: isLoadingContacts, error: errorContacts, refetch } = api.contact.getAllContacts.useQuery({
    skip: 0,
    take: 20,
  })

  if (errorContacts) {
    return <Error
      statusCode={
        errorContacts?.data?.httpStatus ||
        500
      }
    />
  } else {
    return (
      <main className="flex flex-row w-full h-full bg-white rounded-2xl">
        <section className="w-60 overflow-y-auto h-full">
          <div className="flex flex-col gap-2 items-center m-2">
            {contacts?.map((contact: Contact) => (
              <Button
                className="w-full h-full min-h-[4rem] min-w-[8rem] py-4 flex justify-start"
                onPress={() => setSelectedContact(contact)}
                variant={contact === selectedContact ? "solid" : "light"}
                key={contact.phoneNumber}
              >
                <div className="flex flex-row h-full items-center gap-2">
                  <IconUser className="rounded-full h-full w-auto" />
                  <div className="flex flex-col items-start text-black">
                    <span className="text-small">{contact.firstName}</span>
                    <span className="text-tiny text-default-500">{contact.lastName}</span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </section>

        <Divider orientation="vertical" />

        <section className="flex flex-col w-full h-full min-h-0">
          <div className="w-full flex flex-row items-center text-center min-h-10">
            <div className="w-1/2">Text</div>
            <div className="w-1/2">Email</div>
          </div>

          <Divider />

          {selectedContact ? (
            <div className="flex flex-row h-full min-h-0">

              <div className="w-1/2 flex flex-col h-full">
                <SMSPanel selectedContact={selectedContact} />
              </div>

              <Divider orientation="vertical" />

              <div className="w-1/2 flex flex-col h-full">
                <EmailPanel selectedContact={selectedContact} />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <h1 className="text-xl">Select a contact to view conversation</h1>
            </div>
          )}
        </section>
      </main>
    );
  }
}
