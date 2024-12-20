import { api } from "~/utils/api";
import { Button, Card, CardBody, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner, useDisclosure, Modal, ModalHeader, ModalBody, ModalFooter, Input, Checkbox, CheckboxGroup, ModalContent, Textarea, DatePicker, Radio, RadioGroup, Tab, Tabs } from "@nextui-org/react";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { FutureEmailMessage, FutureSMSMessage, SMSMessage, WEEKDAY } from "@prisma/client";
import EditScheduleMessage from "./edit/editScheduleMessage";

const UpcomingMessages = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedMessage, setSelectedMessage] = useState<FutureSMSMessage | FutureEmailMessage>();

  const utils = api.useUtils();

  const deleteEmailMessage = api.futureEmail.deleteFutureEmailMessage.useMutation({
    onSuccess: () => {
      utils.futureEmail.getAllUpcomingEmailMessages.invalidate();
    },
    onError: () => {
      alert("Failed to delete email message.");
    },
  });

  const deleteSMSMessage = api.futureSMS.deleteFutureSMSMessage.useMutation({
    onSuccess: () => {
      utils.futureSMS.getAllUpcomingSMSMessages.invalidate();
    },
    onError: () => {
      alert("Failed to delete SMS message.");
    },
  });

  const { data: emailMessages, isLoading: loadingEmails } = api.futureEmail.getAllUpcomingEmailMessages.useQuery();
  const { data: smsMessages, isLoading: loadingSMS } = api.futureSMS.getAllUpcomingSMSMessages.useQuery();

  const isLoading = loadingEmails || loadingSMS;

  const upcomingMessages = [
    ...(emailMessages || []),
    ...(smsMessages || []),
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    return dateA - dateB;
  });

  const handleDelete = async (message: FutureEmailMessage | FutureSMSMessage) => {
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
                <>
                  <ul className="list-none space-y-4">
                    {upcomingMessages.map((message) => (
                      <Card className="max-w-md" key={message.id}>
                        <CardBody className="flex flex-row">
                          <div className="grow flex flex-col gap-2 p-4">
                            <p className="text-md">{message.to}</p>
                            <p className="text-small text-default-500">{
                              message.date ?
                                new Date(message.date).toLocaleString() :
                                message.days.map((day) => {
                                  const dayString = day.toString().toLowerCase();
                                  return dayString.charAt(0).toUpperCase() + dayString.slice(1);
                                })
                                  .join(", ")
                            }
                            </p>
                          </div>
                          <Divider orientation="vertical" />
                          <Dropdown>
                            <DropdownTrigger>
                              <div className="my-auto hover:cursor-pointer">
                                <IconDotsVertical className="w-8 h-8" />
                              </div>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key="edit"
                                startContent={<IconEdit />}
                                onClick={() => {
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
                                onClick={() => {
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
                </>
              ) : (
                <>
                  <p className="text-center text-gray-500">No upcoming messages scheduled.</p>
                </>
              )
            }

            {
              selectedMessage && (
                <EditScheduleMessage
                  selectedMessage={selectedMessage}
                  isOpen={isOpen}
                  onOpenChange={onOpenChange}
                />
              )
            }
          </>
        )
      }
    </>
  );
};

export default UpcomingMessages;