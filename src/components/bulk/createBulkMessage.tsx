import { useState } from "react";
import { Divider, Accordion, AccordionItem, Button, useDisclosure, Tabs, Tab } from "@heroui/react";
import ToggleButton from "../toggleButton";
import { CAMPUS, COURSE, ENROLLMENT_STATUS, SEMESTER, USER_TYPE, WEEKDAY } from "@prisma/client";
import { enumToStr, strToEnum } from "~/utils/helper";
import BulkListModal from "./bulkListModal";
import SMSMessageBar from "./messaging/sms/smsBarBulk";
import EmailMessageBar from "./messaging/email/emailBarBulk";

const filters = {
  "User Type": Object.values(USER_TYPE)
    .filter((userType) => userType !== USER_TYPE.UNKNOWN)
    .map((userType) => enumToStr(userType)),
  "Enrollment Status": Object.values(ENROLLMENT_STATUS).map(enumToStr),
  "Location": Object.values(CAMPUS),
  "Semester": Object.values(SEMESTER).map(enumToStr),
  "Course": Object.values(COURSE).map(enumToStr),
  "Weekday": Object.values(WEEKDAY).map(enumToStr),
};

const placeholders = [
  { key: "{{firstName}}", label: "First Name" },
  { key: "{{lastName}}", label: "Last Name" },
  { key: "{{familyName}}", label: "Family Name"},
  // { key: "{{course}}", label: "Course" },
  // { key: "{{semester}}", label: "Semester" },
  // { key: "{{location}}", label: "Location" },
];

const CreateBulkMessage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [type, setType] = useState<"sms" | "email">("sms");

  const toggleFilter = (category: string, option: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category]?.includes(option)
        ? prev[category].filter((item) => item !== option)
        : [...(prev[category] || []), option],
    }));
  };

  return (
    <>
      <h2 className="text-center text-2xl">Create Bulk Message</h2>
      <Divider />

      <div className="flex flex-row gap-8">
        <div className="flex flex-col flex-grow gap-4 items-center">
          <h2 className="text-xl text-center">Enter Bulk Message</h2>
          <Divider />

          <Tabs aria-label="Options" onSelectionChange={(e) => setType(e as "sms" | "email")}>
            <Tab key="sms" title="SMS" className="w-full">
              <SMSMessageBar
                attachedImages={attachedFiles}
                setAttachedImages={setAttachedFiles}
                message={message}
                setMessage={setMessage}
                placeholders={placeholders}
              />
            </Tab>
            <Tab key="email" title="Email" className="w-full">
              <EmailMessageBar
                attachedFiles={attachedFiles}
                setAttachedFiles={setAttachedFiles}
                body={message}
                setBody={setMessage}
                subject={subject}
                setSubject={setSubject}
                placeholders={placeholders}
              />
            </Tab>
          </Tabs>
        </div>

        <Divider orientation="vertical" />

        <div className="w-1/3 flex flex-col gap-4">
          <h2 className="text-xl text-center">Select Filters</h2>
          <Divider />
          <div className="flex flex-col gap-4">
            <Accordion selectionMode="multiple">
              {Object.entries(filters).map(([category, options]) => (
                <AccordionItem key={category} aria-label={category} title={category} subtitle="Press to expand">
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <ToggleButton
                        key={option}
                        name={option}
                        onClick={() => toggleFilter(category, option)
                        }
                        isSelected={selectedFilters[category]?.includes(option) || false}
                      />
                    ))}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      <div className="grow flex justify-end items-end w-full h-full">
        <Button color="primary" onPress={onOpen}>
          Next
        </Button>
      </div>

      <BulkListModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        filters={{
          userType: (selectedFilters["User Type"] || []).map(strToEnum) as USER_TYPE[] || undefined,
          enrollmentStatus: (selectedFilters["Enrollment Status"] || []).map(strToEnum) as ENROLLMENT_STATUS[] || undefined,
          location: (selectedFilters["Location"] || []).map(strToEnum) as CAMPUS[] || undefined,
          semester: (selectedFilters["Semester"] || []).map(strToEnum) as SEMESTER[] || undefined,
          course: (selectedFilters["Course"] || []).map(strToEnum) as COURSE[] || undefined,
          weekday: (selectedFilters["Weekday"] || []).map(strToEnum) as WEEKDAY[] || undefined,
        }}
        subject={subject}
        message={message}
        type={type}
        attachedFiles={attachedFiles}
      />
    </>
  );
};

export default CreateBulkMessage;
