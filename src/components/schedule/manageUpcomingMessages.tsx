import { api } from "~/utils/api";
import { Button, Card, CardBody, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner, useDisclosure } from "@heroui/react";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Enrollment, Family, FutureEmailMessage, FutureSMSMessage, User } from "@prisma/client";
import toast from "react-hot-toast";
import EditScheduleMessage from "./editScheduleMessage";

type PropType = {
  emailMessages: FutureEmailMessage[];
  smsMessages: FutureSMSMessage[];
  users: (User & {
    family: Family | null;
    enrollment: Enrollment[];
  })[];
  isLoading: boolean;
}

const ManageUpcomingMessages = (props: PropType) => {
  const {
    emailMessages,
    smsMessages,
    users,
    isLoading
  } = props;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedMessage, setSelectedMessage] = useState<FutureSMSMessage | FutureEmailMessage>();

  const utils = api.useUtils();

  const deleteEmailMessage = api.futureEmail.deleteFutureEmailMessage.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully deleted message!");
      utils.futureEmail.getAllUpcomingEmailMessages.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  const deleteSMSMessage = api.futureSMS.deleteFutureSMSMessage.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully deleted message!");
      utils.futureSMS.getAllUpcomingSMSMessages.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  // Merge and sort upcoming messages by date
  const upcomingMessages = [
    ...(emailMessages || []),
    ...(smsMessages || []),
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    return dateA - dateB;
  });

  const getRecipientName = (message: FutureEmailMessage | FutureSMSMessage) => {
    if ("subject" in message) {
      const email = message.to[0];
      const user = users.find((u) => u.email === email);
      return user ? `${user.firstName} ${user.lastName}` : email;
    } else {
      const phone = message.to;
      const user = users.find((u) => u.phoneNumber === phone);
      return user ? `${user.firstName} ${user.lastName}` : phone;
    }
  };

  const handleDelete = async (message: FutureEmailMessage | FutureSMSMessage) => {
    toast.loading("Deleting message...");
    try {
      if ("subject" in message) {
        await deleteEmailMessage.mutateAsync({ id: message.id });
      } else {
        await deleteSMSMessage.mutateAsync({ id: message.id });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <>
      <h2 className="text-xl text-center">Manage Messages</h2>
      <Divider />
      {
        isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner label="Loading..." />
          </div>
        ) : (
          <>
            {
              upcomingMessages.length !== 0 ? (
                <ul className="list-none space-y-4">
                  {upcomingMessages.map((message) => (
                    <Card key={message.id}>
                      <CardBody className="flex flex-row items-center justify-between truncate">
                        <div className="max-w-full grow flex flex-col gap-2 p-4 truncate">
                          {/* Display first and last name instead of message.to */}
                          <p className="text-md truncate">{getRecipientName(message)}</p>

                          <p className="text-sm text-default-500 truncate">
                            {message.date
                              ? new Date(message.date).toLocaleString()
                              : message.days
                                .map((day) => {
                                  const dayString = day.toString().toLowerCase();
                                  return dayString.charAt(0).toUpperCase() + dayString.slice(1);
                                })
                                .join(", ")}
                          </p>
                        </div>

                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly className="hover:cursor-pointer" variant="light">
                              <IconDotsVertical />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="edit"
                              startContent={<IconEdit />}
                              onPress={() => {
                                setSelectedMessage(message);
                                onOpen();
                              }}
                            >
                              Edit Message
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<IconTrash />}
                              onPress={() => {
                                handleDelete(message);
                              }}
                            >
                              Delete Message
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </CardBody>
                    </Card>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No upcoming messages scheduled.</p>
              )
            }

            {selectedMessage && (
              <EditScheduleMessage
                selectedMessage={selectedMessage}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
              />
            )}
          </>
        )
      }
    </>
  );
};

export default ManageUpcomingMessages;
