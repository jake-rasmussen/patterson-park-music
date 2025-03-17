import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { User, EmailMessage, Status } from "@prisma/client";
import Error from "next/error";
import { Spinner } from "@heroui/react";
import MessageBubble from "../messageBubble";
import { formatDate } from "~/utils/helper";
import { IconMessage2X, IconMessageDown } from "@tabler/icons-react";

type PropType = {
  selectedUser: User;
  email: string;
}

const EmailView = (props: PropType) => {
  const {
    selectedUser,
    email
  } = props;

  const updateUser = api.user.updateUser.useMutation();

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
      newEmailMessage.date = new Date();

      if (newEmailMessage.from === selectedUser.email) {
        setMessages((prevMessages) => [...prevMessages, newEmailMessage]);
        setNewMessageAlert(true); // Trigger new message alert
      }
    },
    onError: (error) => {
      console.error(error);
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
          if (entry.isIntersecting && newMessageAlert) {
            updateUser.mutate({ id: selectedUser.id, unreadMessage: false });
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
      <>
        {newMessageAlert && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
            <div className="animate-bounce border bg-gray-400 rounded-full w-fit p-2 shadow-xl shadow-gray-400">
              <IconMessageDown className="text-white h-10 w-10" />
            </div>
          </div>
        )}

        <section className="overflow-scroll h-full min-w-[35rem]" ref={containerRef}>
          <div className="flex flex-col h-full">
            {
              isLoading ?
                <div className="w-full h-full flex justify-center items-center">
                  <Spinner label="Loading..." className="m-auto" />
                </div>
                :
                <div className="w-full h-full flex flex-col">
                  <div className="flex h-full flex-col gap-2 pb-4">
                    {
                      messages.length > 0 ? (
                        <>
                          {messages.map((message: EmailMessage, index: number) => {
                            const previousMessage = messages[index - 1];
                            const showDate =
                              !previousMessage ||
                              new Date(message.date).getTime() - new Date(previousMessage.date).getTime() > 60 * 60 * 1000;

                            return (
                              <div className="px-4" key={message.id}>
                                {showDate && <p className="w-full text-center py-2">{formatDate(message.date)}</p>}
                                <MessageBubble
                                  status={message.to.includes(email!) ? Status.SENT : Status.RECEIVED}
                                  body={message.body}
                                  subject={message.subject}
                                  dateSent={message.date}
                                  contact={selectedUser}
                                  imageUrls={message.attachments || null} // Pass the first media URL as the image
                                  type="email"
                                  errorCode={message.errorCode || undefined}
                                />
                              </div>
                            );
                          })}
                          <div ref={bottomRef} />
                        </>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <IconMessage2X className="w-20 h-20 text-primary" />
                        </div>
                      )
                    }
                  </div>
                </div>
            }
          </div>
        </section>
      </>
    );
  }
}

export default EmailView;