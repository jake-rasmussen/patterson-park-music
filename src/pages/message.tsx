

import { Button, Card, Divider, Tab, Tabs } from "@nextui-org/react";
import { useState } from "react";
import { api } from "~/utils/api";
import CreateMessage from "~/components/messaging/createMessage";
import { Contact } from "@prisma/client";
import { IconUser } from "@tabler/icons-react";
import Error from "next/error";
import SMSView from "~/components/messaging/sms/smsView";
import EmailView from "~/components/messaging/email/emailView";
import SMSMessageBar from "~/components/messaging/sms/smsBar";
import EmailMessageBar from "~/components/messaging/email/emailBar";

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
        <main className="flex min-h-screen flex-col gap-20 items-center py-20">
          <Card className="flex flex-col gap-4 w-screen max-w-[1920px] h-full p-10 bg-gray-100">
            <div className="w-full flex justify-end">
              <CreateMessage />
            </div>

            <section className="grid grid-cols-6 gap-4 h-full">
              <div className="col-span-1 overflow-y-scroll relative h-full">
                <div className="flex flex-col gap-2 items-center m-2 max-h-[50vh]">
                  {
                    contacts?.map((contact: Contact) => (
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
                    ))
                  }
                </div>
              </div>
              <div className="col-span-5 flex flex-col rounded-xl relative">
                <Divider orientation="vertical" className="absolute left-0 py-4" />
                {selectedContact ? (
                  <div className="flex flex-col w-full h-full">
                    <div className="flex flex-col h-full overflow-hidden">
                      <Tabs className="pt-4 w-full flex items-center justify-center" variant="underlined">
                        <Tab key="sms" title="Text" className="w-full">
                          <Divider />
                          <div className="flex-1 overflow-y-auto max-h-[50vh]">
                            <SMSView selectedContact={selectedContact} />
                          </div>
                          <Divider />
                          <div className="w-full p-4 bg-gray-100">
                            <SMSMessageBar to={selectedContact.phoneNumber} />
                          </div>
                        </Tab>
                        <Tab key="email" title="Email" className="w-full">
                          <Divider />
                          <div className="flex-1 overflow-y-auto max-h-[50vh]">
                            <EmailView selectedContact={selectedContact} />
                          </div>
                          <Divider />
                          <div className="w-full p-4 bg-gray-100">
                            <EmailMessageBar to={[selectedContact.email!]} />
                          </div>
                        </Tab>
                      </Tabs>

                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center h-[60vh]">
                    <h1 className="text-xl">Select a contact to view conversation</h1>
                  </div>
                )} 
              </div> {/* TODO: Set default behavior to select first contact */}
            </section>
          </Card>
        </main >
      </>
    );
  }
}
