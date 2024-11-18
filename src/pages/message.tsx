

import { Button, Card, CardBody, Divider, Tab, Tabs } from "@nextui-org/react";
import { useState } from "react";
import { api } from "~/utils/api";
import CreateMessage from "~/components/messaging/createMessage";
import { Contact } from "@prisma/client";
import { IconUser } from "@tabler/icons-react";
import Error from "next/error";
import SMSView from "~/components/messaging/sms/smsView";
import EmailView from "~/components/messaging/email/emailView";
import MessageBar from "~/components/messaging/sms/smsBar";

export default function Message() {
  const [selectedContact, setSelectedContact] = useState<Contact>();

  const { data: contacts, isLoading: isLoadingContacts, error: errorContacts } = api.contact.getAllContacts.useQuery({
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
      <>
        <main className="flex min-h-screen flex-col items-center">
          <div className="flex flex-col gap-4 w-screen max-w-[1920px] p-20 px-60">
            <div className="w-full flex justify-end">
              <CreateMessage />
            </div>

            <section className="grid grid-cols-6 gap-4">
              <div className="col-span-1 overflow-y-scroll relative">
                <div className="flex flex-col gap-2 items-center m-2">
                  {
                    contacts?.map((contact: Contact) => (
                      <Button
                        className="w-full py-4 h-full flex justify-start"
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
                    ))
                  }
                </div>
              </div>
              <div className="col-span-5 flex flex-col rounded-xl relative">
                <Divider orientation="vertical" className="absolute left-0 py-4" />
                {
                  selectedContact ?
                    <div className="flex flex-col items-center">
                      <Tabs className="pt-4 w-full flex items-center justify-center" variant="underlined">
                        <Tab key="sms" title="Text" className="w-full">
                          <Divider className="" />
                          <SMSView selectedContact={selectedContact} />
                        </Tab>
                        <Tab key="email" title="Email" className="w-full">
                          <Divider className="" />
                          <EmailView selectedContact={selectedContact} />
                        </Tab>
                      </Tabs>
                    </div>
                    :
                    <div className="w-full h-full flex items-center justify-center">
                      <h1 className="text-xl">Select a contact to view conversation</h1>
                    </div>
                }
              </div>
            </section>
          </div>
        </main>
      </>
    );
  }
}
