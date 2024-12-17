import { Divider, Spinner } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/helper";
import MessageBubble from "../messageBubble";
import { Contact, SMSMessage } from "@prisma/client";
import Error from "next/error";
import SMSMessageBar from "./smsBar";

type PropType = {
  selectedContact: Contact;
}

const SMSView = (props: PropType) => {
  const {
    selectedContact
  } = props;

  const [messages, setMessages] = useState<SMSMessage[]>([]);

  const {
    data: conversations,
    isLoading,
    isError,
    error
  } = api.sms.getSMSConversations.useQuery({
    phoneNumber: selectedContact.phoneNumber,
  });

  api.supabase.onSMSInsert.useSubscription(undefined, {
    onData: (data) => {
      const newSMSMessage = data as SMSMessage;
      newSMSMessage.dateSent = new Date();

      setMessages((prevMessages) => [...prevMessages, newSMSMessage]);
    },
    onError: (error) => {
      console.log("Error:", error);
    }
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
    return (
      <section className="overflow-y-scroll h-full">
        <div className="flex flex-col h-full">
          {
            isLoading ?
              <div className="w-full h-full flex justify-center items-center">
                <Spinner label="Loading..." className="m-auto"/>
              </div>
              :
              <div className="w-full flex flex-col">
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
                          status={message.to === selectedContact.phoneNumber ? "received" : "sent"}
                          body={message.body}
                          dateSent={message.dateSent}
                          contact={selectedContact}
                          imageUrls={message.mediaUrls || null} // Pass the first media URL as the image
                          type="sms"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
          }
        </div>
      </section>
    );
  }
}

export default SMSView;