import { Divider, Spinner } from "@nextui-org/react";
import { useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/helper";
import MessageBubble from "../messageBubble";
import { SMSMessage, Status, User } from "@prisma/client";
import Error from "next/error";
import { IconMessageDown } from "@tabler/icons-react";

type PropType = {
  selectedUser: User;
};

const SMSView = (props: PropType) => {
  const { selectedUser } = props;

  const updateUser = api.user.updateUser.useMutation();

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  const { data: initialMessages, isLoading, isError, error } = api.sms.getSMSConversations.useQuery({
    phoneNumber: selectedUser.phoneNumber,
  });

  api.supabase.onSMSInsert.useSubscription(undefined, {
    onData: (data) => {
      const newSMSMessage = data as SMSMessage;
      newSMSMessage.date = new Date();

      if (newSMSMessage.from === selectedUser.phoneNumber) {
        setMessages((prevMessages) => [...prevMessages, newSMSMessage]);
        setNewMessageAlert(true); // Trigger new message alert
      }
    },
    onError: (error) => {
      console.log("Error:", error);
    },
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    setTimeout(() => {
      if (initialMessages && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  }, [initialMessages, bottomRef.current]);

  // Use IntersectionObserver to check if bottomRef is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && newMessageAlert) {
            setNewMessageAlert(false); // Remove alert only when scrolled to bottom
            updateUser.mutate({ id: selectedUser.id, unreadMessage: false })
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
    return <Error statusCode={error?.data?.httpStatus || 500} />;
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

        <section className="overflow-y-scroll h-full relative" ref={containerRef}>
          <div className="flex flex-col h-full">
            {isLoading ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spinner label="Loading..." className="m-auto" />
              </div>
            ) : (
              <div className="w-full flex flex-col">
                <div className="flex flex-col gap-2 pb-4">
                  {messages.map((message: SMSMessage, index: number) => {
                    const previousMessage = messages[index - 1];
                    const showDate =
                      !previousMessage ||
                      new Date(message.date).getTime() - new Date(previousMessage.date).getTime() > 60 * 60 * 1000;

                    return (
                      <div className="px-4" key={message.id}>
                        {showDate && <p className="w-full text-center py-2">{formatDate(message.date)}</p>}
                        <MessageBubble
                          status={message.to === selectedUser.phoneNumber ? Status.SENT : Status.RECEIVED}
                          body={message.body}
                          dateSent={message.date}
                          contact={selectedUser}
                          imageUrls={message.mediaUrls || null}
                          type="sms"
                          errorCode={message.errorCode || undefined}
                        />
                      </div>
                    );
                  })}
                  <div ref={bottomRef} /> {/* Invisible div for scroll-to-bottom */}
                </div>
              </div>
            )}
          </div>
        </section>
      </>

    );
  }
};

export default SMSView;
