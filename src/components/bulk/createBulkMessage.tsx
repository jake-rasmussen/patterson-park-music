import { useState } from "react";
import { Divider, Textarea, Accordion, AccordionItem, Button, useDisclosure } from "@heroui/react";
import ToggleButton from "../toggleButton";
import { CAMPUS, COURSE, ENROLLMENT_STATUS, SEMESTER, USER_TYPE, WEEKDAY } from "@prisma/client";
import { enumToStr, strToEnum } from "~/utils/helper";
import BulkListModal from "./bulkListModal";

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
  { key: "{{course}}", label: "Course" },
  { key: "{{semester}}", label: "Semester" },
  { key: "{{location}}", label: "Location" },
];

const CreateBulkMessage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");

  const toggleFilter = (category: string, option: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category]?.includes(option)
        ? prev[category].filter((item) => item !== option)
        : [...(prev[category] || []), option],
    }));
  };

  console.log(selectedFilters)

  const insertPlaceholder = (placeholder: { key: string; label: string }) => {
    setMessage((prev) => prev + ` [${placeholder.label}] `);
  };

  const processBulkMessages = (recipients: { firstName: string; lastName: string; course: string }[]) => {
    return recipients.map((recipient) => {
      return message
        .replace(/\[First Name\]/g, recipient.firstName)
        .replace(/\[Last Name\]/g, recipient.lastName)
        .replace(/\[Course\]/g, recipient.course);
    });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center">Create Bulk Message</h2>
      <Divider />

      <div className="flex flex-row gap-8">
        <div className="flex flex-col flex-grow gap-4">
          <h2 className="text-xl text-center">Enter Bulk Message</h2>
          <Divider />

          <div className="flex flex-wrap gap-2">
            {placeholders.map((placeholder) => (
              <Button key={placeholder.key} size="sm" onPress={() => insertPlaceholder(placeholder)}>
                {placeholder.label}
              </Button>
            ))}
          </div>

          <Textarea
            label="Enter bulk message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            minRows={10}
          />
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
                        onClick={() => {
                          toggleFilter(category, option)
                          console.log(category, option)
                        }}
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
      />
    </>
  );
};

export default CreateBulkMessage;
