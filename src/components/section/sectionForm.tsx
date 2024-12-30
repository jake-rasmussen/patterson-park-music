import { Button } from "@nextui-org/button";
import { Select, SelectItem, TimeInput, TimeInputValue, Input } from "@nextui-org/react";
import { COURSE, SEMESTER, User, WEEKDAY } from "@prisma/client";
import { Field, Form } from "houseform";
import { z } from "zod";
import { capitalizeToUppercase, parseTimeInputValue, formatTimeInputValue } from "~/utils/helper";

type PropType = {
  handleSubmit: (values: Record<string, any>) => Promise<void>;
  onClose?: () => void;
  initialValues?: Partial<Record<string, any>>; // Optional initial values
  teachers: User[];
};

const SectionForm = (props: PropType) => {
  const { handleSubmit, onClose, initialValues = {}, teachers } = props;

  return (
    <Form
      onSubmit={async (values, { reset }) => {
        handleSubmit(values);
        reset();
        values.startTime = "";
      }}
    >
      {({ isValid, submit }) => (
        <div className="flex flex-col gap-4">
          <Field<string>
            name="teacherId"
            initialValue={initialValues.teacherId || ""}
            onChangeValidate={z.string().min(1, { message: "Please select a teacher" })}
          >
            {({ value, setValue, isValid, errors }) => {
              const selectedTeacher = teachers.find((teacher) => teacher.id === value);

              return (
                <Select
                  label="Teacher"
                  selectedKeys={value ? new Set([value]) : new Set()}
                  onSelectionChange={(keys) => setValue(Array.from(keys).pop() as string)}
                  isInvalid={!isValid}
                  errorMessage={errors[0]}
                  isRequired
                  renderValue={() =>
                    selectedTeacher
                      ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`
                      : "Select a teacher"
                  }
                >
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </Select>
              );
            }}
          </Field>

          <Field<COURSE>
            name="course"
            initialValue={initialValues.course || undefined} // Set default value
            onChangeValidate={z.nativeEnum(COURSE, { errorMap: () => ({ message: "Please select a valid course" }) })}
          >
            {({ value, setValue, errors }) => (
              <Select
                label="Course"
                selectedKeys={value ? new Set([value]) : new Set()}
                onSelectionChange={(keys) => setValue(Array.from(keys).pop() as COURSE)}
                isInvalid={!!errors.length}
                errorMessage={errors[0]}
                isRequired
              >
                {Object.values(COURSE).map((course) => (
                  <SelectItem key={course} value={course}>
                    {capitalizeToUppercase(course)}
                  </SelectItem>
                ))}
              </Select>
            )}
          </Field>

          <Field<SEMESTER[]>
            name="semesters"
            initialValue={initialValues.semesters || []} // Set default value
            onChangeValidate={z.array(z.nativeEnum(SEMESTER), { errorMap: () => ({ message: "Please select at least one semester" }) })}
          >
            {({ value, setValue, errors }) => (
              <Select
                label="Semesters"
                selectedKeys={value ? new Set(value) : new Set()}
                onSelectionChange={(keys) => setValue(Array.from(keys) as SEMESTER[])}
                selectionMode="multiple"
                isInvalid={!!errors.length}
                errorMessage={errors[0]}
                isRequired
              >
                {Object.values(SEMESTER).map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {capitalizeToUppercase(semester)}
                  </SelectItem>
                ))}
              </Select>
            )}
          </Field>

          <Field<WEEKDAY[]>
            name="weekdays"
            initialValue={initialValues.weekdays || []} // Set default value
            onChangeValidate={z.array(z.nativeEnum(WEEKDAY), { errorMap: () => ({ message: "Please select at least one weekday" }) })}
          >
            {({ value, setValue, errors }) => (
              <Select
                label="Weekdays"
                selectedKeys={value ? new Set(value) : new Set()}
                onSelectionChange={(keys) => setValue(Array.from(keys) as WEEKDAY[])}
                selectionMode="multiple"
                isInvalid={!!errors.length}
                errorMessage={errors[0]}
                isRequired
              >
                {Object.values(WEEKDAY).map((day) => (
                  <SelectItem key={day} value={day}>
                    {capitalizeToUppercase(day)}
                  </SelectItem>
                ))}
              </Select>
            )}
          </Field>

          <Field<string>
            name="startTime"
            initialValue={initialValues.startTime || ""} // Set default value
            onChangeValidate={z.string().min(1, "Start time is required")}
          >
            {({ value, setValue, onBlur, isValid, errors }) => (
              <TimeInput
                label="Start Time"
                value={value ? parseTimeInputValue(value) : null}
                onChange={(time: TimeInputValue) => setValue(formatTimeInputValue(time))}
                onBlur={onBlur}
                isInvalid={!isValid}
                errorMessage={errors[0]}
                isRequired
              />
            )}
          </Field>

          <div className="flex flex-row gap-2 justify-end items-end w-full my-4">
            {onClose && (
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
            )}
            <Button color="primary" isDisabled={!isValid} onPress={submit}>
              Submit
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
};

export default SectionForm;