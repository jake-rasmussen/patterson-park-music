import { Modal, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button, Input, Checkbox, CheckboxGroup, DatePicker, ModalContent, Radio, RadioGroup, Tab, Tabs, Textarea, Spinner } from "@nextui-org/react";
import { Field, Form } from "houseform";
import { number, z } from "zod";
import { api } from "~/utils/api";
import { FutureEmailMessage, FutureSMSMessage, WEEKDAY } from "@prisma/client";
import { toast } from "react-hot-toast";
import EmailMessageBar from "~/components/messaging/email/emailBar";
import SMSMessageBar from "~/components/messaging/sms/smsBar";
import message from "~/pages/message";
import { capitalizeToUppercase, dateToDateValue } from "~/utils/helper";
import { useState } from "react";

type PropType = {
  selectedMessage: FutureSMSMessage | FutureEmailMessage;
  isOpen: boolean;
  onOpenChange: () => void;
};

const EditScheduleMessage = (props: PropType) => {
  const {
    selectedMessage,
    isOpen,
    onOpenChange,
  } = props;

  const isFutureEmailMessage = (message: FutureEmailMessage | FutureSMSMessage): message is FutureEmailMessage => {
    return Array.isArray(message.to); // Email messages have 'to' as an array
  }

  const utils = api.useUtils();

  const { data: contact, isLoading } = api.contact.getContactByNumberOrEmail.useQuery({
    phoneNumber: isFutureEmailMessage(selectedMessage) ? undefined : selectedMessage.to,
    email: isFutureEmailMessage(selectedMessage) ? selectedMessage.to[0] : undefined
  });

  const { mutateAsync: updateEmailMessage } = api.futureEmail.updateFutureEmailMessage.useMutation();
  const { mutateAsync: updateSMSMessage } = api.futureSMS.updateFutureSMSMessage.useMutation();

  const [isRecurring, setIsRecurring] = useState(!selectedMessage.date);
  const [selectedDate, setSelectedDate] = useState<Date | null>(selectedMessage.date);
  const [selectedDays, setSelectedDays] = useState<WEEKDAY[]>(selectedMessage.days);

  const [smsMessage, setSMSMessage] = useState<string>(selectedMessage.body);
  const [emailSubject, setEmailSubject] = useState<string>("subject" in selectedMessage && selectedMessage.subject ? selectedMessage.subject : "");
  const [emailMessage, setEmailMessage] = useState<string>(selectedMessage.body);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);


  const handleEditScheduleMessage = async () => {
    try {
      if (isFutureEmailMessage(selectedMessage)) {
        await updateEmailMessage({
          id: selectedMessage.id,
          to: selectedMessage.to,
          body: emailMessage,
          subject: emailSubject,
          days: isRecurring ? selectedDays : null,
          date: isRecurring ? null : selectedDate || null,
          // TODO: add media urls
        });
      } else {
        await updateSMSMessage({
          id: selectedMessage.id,
          to: selectedMessage.to,
          body: smsMessage,
          days: isRecurring ? selectedDays : null,
          date: isRecurring ? null : selectedDate || null,
          // TODO: add media urls
        });
      }

      toast.success("Message updated successfully!");
      onOpenChange();

      utils.invalidate();
    } catch (error) {
      toast.error("Failed to update message.");
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            {
              isLoading ? <div className="w-full h-full flex justify-center items-center min-h-96">
                <Spinner label="Loading..." className="m-auto" />
              </div> : <>
                <ModalHeader>Edit Message to {contact?.firstName} {contact?.lastName}</ModalHeader>

                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <RadioGroup label="What type of message would you like to send?" defaultValue="once" value={isRecurring ? "recurring" : "once"}>
                        <Radio value="once" onClick={() => setIsRecurring(false)}>One time message</Radio>
                        <Radio value="recurring" onClick={() => setIsRecurring(true)}>Recurring message</Radio>
                      </RadioGroup>
                    </div>


                    {isFutureEmailMessage(selectedMessage) && (
                      <Input
                        label="Enter Subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.currentTarget.value)}
                      />
                    )}

                    {
                      isFutureEmailMessage(selectedMessage) ? (
                        <Textarea
                          label="Enter Message"
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.currentTarget.value)}
                        />
                      ) : (
                        <Input
                          label="Enter Message"
                          value={smsMessage}
                          onChange={(e) => setSMSMessage(e.currentTarget.value)}
                        />
                      )
                    }

                    {
                      isRecurring ? <>
                        <CheckboxGroup
                          label="What day of the week would you like to send the message?"
                          value={selectedDays}
                          onChange={(newSelectedDays) => setSelectedDays(newSelectedDays as WEEKDAY[])}
                        >
                          {Object.entries(WEEKDAY).map(([key, value]) => (
                            <Checkbox
                              key={key}
                              value={value}
                            >
                              {capitalizeToUppercase(value)}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>
                      </> : <>
                        <DatePicker
                          label="Send Date"
                          value={selectedDate && dateToDateValue(selectedDate)}
                          onChange={(e) => {
                            console.log(e);
                            if (e) {
                              setSelectedDate(new Date(e.year, e.month - 1, e.day));
                            }
                          }}
                          variant="underlined"
                          size="lg"
                          isRequired
                          className="max-w-xs"
                        />
                      </>
                    }

                    <ModalFooter className="px-0 py-4">
                      <Button color="danger" variant="light" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button color="primary" onPress={handleEditScheduleMessage}>
                        Submit
                      </Button>
                    </ModalFooter>
                  </div>
                </ModalBody></>
            }
          </>
        )}
      </ModalContent>
    </Modal >
  );
};

export default EditScheduleMessage;
