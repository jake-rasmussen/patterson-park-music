import { Button } from "@heroui/button";
import { Select, SelectItem, DateRangePicker, ModalFooter } from "@heroui/react";
import { ENROLLMENT_STATUS, Section, User } from "@prisma/client";
import { Field, Form } from "houseform";
import { z } from "zod";
import { enumToStr } from "~/utils/helper";
import { parseDate } from "@internationalized/date";

type PropType = {
  handleSubmit: (values: Record<string, any>) => Promise<void>;
  onClose?: () => void;
  initialValues?: Partial<Record<string, any>>;
  sections: (Section & { teacher: User })[];
};

const EnrollmentForm = (props: PropType) => {
  const { handleSubmit, onClose, initialValues = {}, sections } = props;

  return (
    <Form
      onSubmit={async (values) => {
        await handleSubmit(values);
      }}
    >
      {({ isValid, submit }) => (
        <div className="flex flex-col gap-4">
          <Field<string>
            name="sectionId"
            initialValue={initialValues.sectionId}
            onChangeValidate={z.string().min(1, { message: "Please select a section" })}
          >
            {({ value, setValue, isValid, errors }) => {
              const selectedSection = sections.find((section) => section.id === value);

              return (
                <Select
                  label="Section"
                  selectedKeys={value ? new Set([value]) : new Set()}
                  onSelectionChange={(keys) => setValue(Array.from(keys).pop() as string)}
                  isInvalid={!isValid}
                  errorMessage={errors[0]}
                  isRequired
                  renderValue={() =>
                    selectedSection
                      ? `${enumToStr(selectedSection.course)} with ${selectedSection.teacher.firstName}`
                      : "Select a section˝"
                  }
                >
                  {sections.map((section) => (
                    <SelectItem key={section.id}>
                      {enumToStr(section.course)} with {section.teacher.firstName}
                    </SelectItem>
                  ))}
                </Select>
              );
            }}
          </Field>

          <div className="flex flex-row gap-4">
            <Field<{ start: Date; end: Date } | null>
              name="dateRange"
              initialValue={initialValues.dateRange || null}
              onChangeValidate={z
                .object({ start: z.date(), end: z.date() })
                .nullable()
                .refine((data) => data !== null, { message: "Please select an enrollment duration" })}
            >
              {({ value, setValue, isValid, errors }) => (
                <DateRangePicker
                  label="Enrollment Duration"
                  value={
                    value
                      ? {
                        start: parseDate(value.start.toISOString().split("T")[0]!),
                        end: parseDate(value.end.toISOString().split("T")[0]!),
                      }
                      : null
                  }
                  onChange={(range) =>
                    setValue(
                      range
                        ? { start: new Date(range.start.toString()), end: new Date(range.end.toString()) }
                        : null
                    )
                  }
                  isInvalid={!isValid}
                  errorMessage={"Please selected a valid date range"}
                  variant="underlined"
                  className="max-w-xs mb-4"
                />
              )}
            </Field>

            <Field<ENROLLMENT_STATUS>
              name="status"
              initialValue={initialValues.status}
              onChangeValidate={z.nativeEnum(ENROLLMENT_STATUS, { errorMap: () => ({ message: "Please select a valid status" }) })}
            >
              {({ value, setValue, isValid, errors }) => (
                <Select
                  label="Enrollment Status"
                  selectedKeys={value ? new Set([value]) : new Set()}
                  onSelectionChange={(keys) => setValue(Array.from(keys).pop() as ENROLLMENT_STATUS)}
                  isInvalid={!isValid}
                  errorMessage={errors[0]}
                  className="max-w-xs"
                  variant="underlined"
                  isRequired
                >
                  {Object.values(ENROLLMENT_STATUS).map((status) => (
                    <SelectItem key={status}>
                      {enumToStr(status)}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </Field>
          </div>


          <ModalFooter className="flex flex-row gap-2 justify-end items-end pr-0">
            {onClose && (
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
            )}
            <Button color="primary" isDisabled={!isValid} onPress={submit}>
              Submit
            </Button>
          </ModalFooter>
        </div>
      )
      }
    </Form >
  );
};

export default EnrollmentForm;
