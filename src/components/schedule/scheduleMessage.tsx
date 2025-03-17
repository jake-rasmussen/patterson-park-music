import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/modal";
import { DatePicker, Divider, Spinner, RadioGroup, Radio, Checkbox, CheckboxGroup, Tab, Tabs, Input } from "@heroui/react";
import { User, WEEKDAY } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";
import ContactCard from "../user/contactCard";
import { enumToStr, dateToDateValue } from "~/utils/helper";
import SMSMessageBar from "../messaging/sms/smsBar";
import EmailMessageBar from "../messaging/email/emailBar";
import toast from "react-hot-toast";
import { useFileUpload } from "~/hooks/fileUpload";
import { IconSearch } from "@tabler/icons-react";

type PropType = {
  users: User[];
  isLoading: boolean;
}

const ScheduleMessage = (props: PropType) => {
  const { users, isLoading } = props;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { handleFileUploadEmail, handleFileUploadSMS } = useFileUpload();

  const [query, setQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const utils = api.useUtils();

  const createFutureSMSMessage = api.futureSMS.createFutureSMSMessage.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Text scheduled successfully!");

      reset();
      onOpenChange();

      utils.invalidate();
      setIsSending(false);
    },

    onError() {
      toast.dismiss();
      toast.error("Error...");
      setIsSending(false);
    }
  });

  const createFutureEmailMessage = api.futureEmail.createFutureEmailMessage.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Email scheduled successfully!");

      reset();
      onOpenChange();
      utils.invalidate();
      setIsSending(false);
    },

    onError() {
      toast.dismiss();
      toast.error("Error...");
      setIsSending(false);
    }
  })

  const [selectedUser, setSelectedUser] = useState<User>();

  const [isSending, setIsSending] = useState<boolean>(false);

  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDays, setSelectedDays] = useState<WEEKDAY[]>([]);

  const [smsMessage, setSMSMessage] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const reset = () => {
    setIsRecurring(false);
    setSelectedDate(undefined);
    setSelectedDays([]);

    setSMSMessage("");
    setEmailSubject("");
    setEmailMessage("");
    setAttachedFiles([]);
  }

  const handleSendSMSMessage = async () => {
    setIsSending(true);
    toast.loading("Creating scheduled message...");

    const mediaUrls = await handleFileUploadSMS(attachedFiles);

    createFutureSMSMessage.mutate({
      message: smsMessage,
      to: selectedUser!.phoneNumber,
      days: isRecurring ? selectedDays : [],
      date: isRecurring ? undefined : selectedDate,
      mediaUrls,
    })
  }

  const handleSendEmailMessage = async () => {
    setIsSending(true);
    toast.loading("Creating scheduled message...");

    const attachments = await handleFileUploadEmail(attachedFiles);
    const formattedBody = emailMessage.replace(/\n/g, "<br>");

    createFutureEmailMessage.mutate({
      to: [selectedUser?.email!],
      body: formattedBody,
      subject: emailSubject,
      days: isRecurring ? selectedDays : [],
      date: isRecurring ? undefined : selectedDate,
      attachments,
    })
  }

  return (
    <>
      <h2 className="text-xl text-center">Schedule Message</h2>
      <Divider />
      <div className="h-full">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner label="Loading..." />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <Input
              isClearable
              className="max-w-xs"
              placeholder="Search by name"
              startContent={<IconSearch />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onClear={() => setQuery("")}
            />
            <div className="flex flex-wrap gap-4 px-20 items-center justify-center">
              {filteredUsers?.map((contact: User) => (
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
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={() => {
        reset();
        onOpenChange();
      }} size="3xl">
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Schedule Message to {selectedUser?.firstName} {selectedUser?.lastName}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <RadioGroup label="What type of message would you like to send?" value={isRecurring ? "recurring" : "once"}>
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
                          {enumToStr(value)}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  </> : <>
                    <DatePicker
                      label="Send Date"
                      value={selectedDate && dateToDateValue(selectedDate)}
                      onChange={(e) => {
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
                    <Tabs isVertical>
                      <Tab key="sms" title="SMS" className="w-full">
                        <SMSMessageBar
                          message={smsMessage}
                          setMessage={setSMSMessage}
                          attachedImages={attachedFiles}
                          setAttachedImages={setAttachedFiles}
                          isSendDisabled={(isRecurring ? selectedDays.length === 0 : !selectedDate) || (!smsMessage && attachedFiles.length === 0) || isSending}
                          handleSendMessage={handleSendSMSMessage}
                        />
                      </Tab>
                      <Tab key="email" title="Email" className="w-full">
                        <EmailMessageBar
                          attachedFiles={attachedFiles}
                          setAttachedFiles={setAttachedFiles}
                          body={emailMessage}
                          setBody={setEmailMessage}
                          subject={emailSubject}
                          setSubject={setEmailSubject}
                          isSendDisabled={(isRecurring ? selectedDays.length === 0 : !selectedDate) || (!emailMessage && attachedFiles.length === 0) || !emailSubject || isSending}
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
