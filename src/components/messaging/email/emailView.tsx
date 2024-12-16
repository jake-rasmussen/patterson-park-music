import { useEffect, useState } from "react";
import MessageBar from "./emailBar";
import { api } from "~/utils/api";
import { Contact, EmailMessage } from "@prisma/client";
import Error from "next/error";
import { Divider, Spinner } from "@nextui-org/react";
import MessageBubble from "../messageBubble";
import { formatDate } from "~/utils/helper";

type PropType = {
  selectedContact: Contact;
}

const EmailView = (props: PropType) => {
  const {
    selectedContact
  } = props;

  const [messages, setMessages] = useState<EmailMessage[]>([]);

  const {
    data: conversations,
    isLoading,
    isError,
    error
  } = api.email.getEmailConversations.useQuery({
    email: selectedContact.email!
  }, {
    enabled: selectedContact.email !== undefined
  });

  useEffect(() => {
    if (conversations && conversations.messages) {
      setMessages(conversations.messages);
    }
  }, [conversations]);

  if (isError) {
    return <Error
      statusCode={
        error?.data?.httpStatus ||
        500
      }
    />
  } else {
    return (<>
      <div className="flex flex-col overflow-y-scroll h-[50vh]">
        {
          isLoading && selectedContact.email ?
            <div className="w-full flex justify-center items-center h-[50vh]">
              <Spinner label="Loading..." />
            </div>
            :
            <div className="w-full h-full flex flex-col">
              <div className="flex flex-col gap-2 pb-4">
                {messages.map((message, index) => {
                  const previousMessage = messages[index - 1];
                  const showDate =
                    !previousMessage ||
                    new Date(message.dateSent).getTime() - new Date(previousMessage.dateSent).getTime() > 60 * 60 * 1000;

                  return (
                    <div className="px-4" key={message.id}>
                      {showDate && <p className="w-full text-center py-2">{formatDate(message.dateSent)}</p>}
                      <MessageBubble
                        status={message.to.includes(selectedContact.email!) ? "received" : "sent"}
                        body={message.body}
                        dateSent={message.dateSent}
                        contact={selectedContact}
                        imageUrls={message.attachments || null} // Pass the first media URL as the image
                        type="email"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
        }
      </div>
    </>);
  }
}

export default EmailView;