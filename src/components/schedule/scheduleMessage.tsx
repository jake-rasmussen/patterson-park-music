import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/modal";
import { DatePicker, Divider, Spinner, RadioGroup, Radio, Checkbox, CheckboxGroup, Tab, Tabs } from "@nextui-org/react";
import { User, WEEKDAY } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";
import ContactCard from "../contact/contactCard";
import { capitalizeToUppercase, dateToDateValue } from "~/utils/helper";
import SMSMessageBar from "../messaging/sms/smsBar";
import EmailMessageBar from "../messaging/email/emailBar";
import toast from "react-hot-toast";

const ScheduleMessage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const utils = api.useUtils();

  const { data: users, isLoading: isLoadingContacts } = api.user.getAllUsers.useQuery({
    skip: 0,
    take: 20,
  });

  const createFutureSMSMessage = api.futureSMS.createFutureSMSMessage.useMutation({
    onSuccess() {
      toast.success("Text scheduled successfully!");
      reset();
      onOpenChange();

      utils.invalidate();
    },

    onError() {
      toast.error("Error...");
      setIsLoading(false);
    }
  });

  const createFutureEmailMessage = api.futureEmail.createFutureEmailMessage.useMutation({
    onSuccess() {
      toast.success("Email scheduled successfully!");
      reset();
      onOpenChange();
    },

    onError() {
      toast.error("Error...");
      setIsLoading(false);
    }
  })

  const [selectedUser, setSelectedUser] = useState<User>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDays, setSelectedDays] = useState<WEEKDAY[]>([]);

  const [smsMessage, setSMSMessage] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);

  const reset = () => {
    setIsRecurring(false);
    setSelectedDate(undefined);
    setSelectedDays([]);

    setSMSMessage("");
    setEmailSubject("");
    setEmailMessage("");
    setAttachedImages([]);
  }

  const handleSendSMSMessage = () => {
    createFutureSMSMessage.mutate({
      message: smsMessage,
      to: selectedUser!.phoneNumber,
      days: isRecurring ? selectedDays : [],
      date: isRecurring ? undefined : selectedDate,
      // TODO: add media urls
    })
  }

  const handleSendEmailMessage = () => {
    createFutureEmailMessage.mutate({
      to: [selectedUser?.email!],
      body: emailMessage,
      subject: emailSubject,
      days: isRecurring ? selectedDays : [],
      date: isRecurring ? undefined : selectedDate,
      // TODO: add media urls
    })
  }

  return (
    <>
      <h2 className="text-xl text-center">Schedule Message</h2>
      <Divider />
      <div className="h-full">
        {isLoadingContacts ? (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner label="Loading..." />
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 px-20 items-center justify-center">
            {users?.map((contact: User) => (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedUser(contact);
                  onOpen();
                }}
              >
                <ContactCard contact={contact} />
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Schedule Message to {selectedUser?.firstName} {selectedUser?.lastName}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <RadioGroup label="What type of message would you like to send?" defaultValue="once">
                    <Radio value="once" onClick={() => setIsRecurring(false)}>One time message</Radio>
                    <Radio value="recurring" onClick={() => setIsRecurring(true)}>Recurring message</Radio>
                  </RadioGroup>
                </div>

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

                {
                  selectedUser && selectedUser.email && <div className="my-8">
                    <Tabs aria-label="Options" isVertical>
                      <Tab key="sms" title="SMS" className="w-full">
                        <SMSMessageBar
                          message={smsMessage}
                          setMessage={setSMSMessage}
                          attachedImages={attachedImages}
                          setAttachedImages={setAttachedImages}
                          isSendDisabled={(isRecurring ? selectedDays.length === 0 : !selectedDate) || (!smsMessage && attachedImages.length === 0) || isLoading}
                          handleSendMessage={handleSendSMSMessage}
                        />
                      </Tab>
                      <Tab key="email" title="Email" className="w-full">
                        <EmailMessageBar
                          attachedFiles={attachedImages}
                          setAttachedFiles={setAttachedImages}
                          body={emailMessage}
                          setBody={setEmailMessage}
                          subject={emailSubject}
                          setSubject={setEmailSubject}
                          isSendDisabled={(isRecurring ? selectedDays.length === 0 : !selectedDate) || (!emailMessage && attachedImages.length === 0) || !emailSubject || isLoading}
                          handleSendMessage={handleSendEmailMessage}
                        />
                      </Tab>
                    </Tabs>
                  </div>
                }
              </div>
            </ModalBody>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ScheduleMessage;
