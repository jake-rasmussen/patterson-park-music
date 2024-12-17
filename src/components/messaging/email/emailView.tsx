import { useEffect, useRef, useState } from "react";
import MessageBar from "./emailBar";
import { api } from "~/utils/api";
import { Contact, EmailMessage } from "@prisma/client";
import Error from "next/error";
import { Divider, Spinner } from "@nextui-org/react";
import MessageBubble from "../messageBubble";
import { formatDate } from "~/utils/helper";
import EmailMessageBar from "./emailBar";

type PropType = {
  selectedContact: Contact;
  email: string;
}

const EmailView = (props: PropType) => {
  const {
    selectedContact,
    email
  } = props;

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  const {
    data: conversations,
    isLoading,
    isError,
    error
  } = api.email.getEmailConversations.useQuery({
    email: email
  });

  api.supabase.onEmailInsert.useSubscription(undefined, {
    onData: (data) => {
      const newEmailMessage = data as EmailMessage;
      newEmailMessage.dateSent = new Date();

      if (newEmailMessage.from === selectedContact.email) {
        setMessages((prevMessages) => [...prevMessages, newEmailMessage]);
        setNewMessageAlert(true); // Trigger new message alert
      }
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

  useEffect(() => {
    setTimeout(() => {
      if (conversations && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  }, [conversations, bottomRef.current]);

  // Use IntersectionObserver to check if bottomRef is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setNewMessageAlert(false); // Remove alert only when scrolled to bottom
          }
        });
      },
      { threshold: 0.1 }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
    };
  }, [messages]);

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
                <Spinner label="Loading..." className="m-auto" />
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
                          status={message.to.includes(email!) ? "received" : "sent"}
                          body={message.body}
                          dateSent={message.dateSent}
                          contact={selectedContact}
                          imageUrls={message.attachments || null} // Pass the first media URL as the image
                          type="email"
                        />
                      </div>
                    );
                  })}
                  <div ref={bottomRef} /> {/* Invisible div for scroll-to-bottom */}
                </div>
              </div>
          }
        </div>
      </section>
    );
  }
}

export default EmailView;