import { Divider, Spinner } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/helper";
import MessageBubble from "../messageBubble";
import { Contact } from "@prisma/client";
import MessageBar from "./smsBar";
import toast from "react-hot-toast";

type PropType = {
  selectedContact: Contact;
}

const SMSView = (props: PropType) => {
  const {
    selectedContact
  } = props;

  const [messages, setMessages] = useState<any[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const { refetch, isLoading: isLoadingConversation, error: errorConversation } = api.sms.getConversationWithNumber.useQuery(
    { otherNumber: selectedContact?.phoneNumber || "", limit: 10, lastMessageId },
    { enabled: false }
  );

  const handleFetchMessages = () => {
    refetch().then((response) => {
      if (response.data) {
        setMessages(response.data.messages);
        setHasMore(response.data.hasMore);
        setLastMessageId(response.data.lastMessageId || "");
      }
    });
  };

  const handleNextPage = () => {
    handleFetchMessages();
  };

  const handlePreviousPage = () => {
    setLastMessageId(undefined); // Reset to fetch from the latest messages if going back
    handleFetchMessages();
  };

  useEffect(() => {
    if (selectedContact) {
      handleFetchMessages();
    }
  }, [selectedContact]);

  return (
    <div>
      {
        isLoadingConversation ?
          <div className="w-full flex justify-center items-center h-[50vh]">
            <Spinner label="Loading..." />
          </div>
          :
          <div className="w-full flex flex-col">
            <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-scroll pb-4">
              {messages.map((message, index) => {
                const previousMessage = messages[index - 1];
                const showDate =
                  !previousMessage ||
                  new Date(message.dateSent).getTime() - new Date(previousMessage.dateSent).getTime() > 60 * 60 * 1000;

                return (
                  <div className="px-4" key={message.sid}>
                    {showDate && <p className="w-full text-center py-2">{formatDate(message.dateSent)}</p>}
                    <MessageBubble
                      status={message.status}
                      body={message.body}
                      dateSent={message.dateSent}
                      contact={selectedContact}
                      imageUrls={message.mediaUrls || null} // Pass the first media URL as the image
                    />
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-white rounded-xl">
              <Divider className="" />
              <div className="w-full p-4 pb-0">
                <MessageBar to={selectedContact.phoneNumber} />
              </div>
            </div>
          </div>
      }
    </div>
  );
}

export default SMSView;