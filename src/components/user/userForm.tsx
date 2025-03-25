import { Button } from "@heroui/button";
import { CalendarDate, DatePicker, Divider, Input, Select, SelectItem } from "@heroui/react";
import { USER_TYPE, COURSE, CAMPUS } from "@prisma/client";
import { Field, Form } from "houseform";
import { useState } from "react";
import { z } from "zod";
import { enumToStr, dateToDateValue } from "~/utils/helper";

type PropType = {
  handleSubmit: (values: Record<string, any>) => Promise<void>;
  onClose?: () => void;
  initialValues?: Partial<Record<string, any>>;
};

const UserForm = (props: PropType) => {
  const { handleSubmit, onClose, initialValues = {} } = props;

  const [type, setType] = useState<USER_TYPE>(initialValues.type);

  return (
    <Form
      onSubmit={async (values) => {
        handleSubmit(values);
      }}
    >
      {({ isValid, submit }) => (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <Field<string>
                name="firstName"
                onChangeValidate={z.string().min(1, "Enter your first name")}
                initialValue={initialValues.firstName}
              >
                {({ value, setValue, onBlur, isValid, errors }) => (
                  <Input
                    label="First Name"
                    value={value}
                    onChange={(e) => setValue(e.currentTarget.value)}
                    onBlur={onBlur}
                    isInvalid={!isValid}
                    errorMessage={errors[0]}
                    isRequired
                    size="sm"
                  />
                )}
              </Field>

              <Field<string>
                name="lastName"
                onChangeValidate={z.string().min(1, "Enter your last name")}
                initialValue={initialValues.lastName}
              >
                {({ value, setValue, onBlur, isValid, errors }) => (
                  <Input
                    label="Last Name"
                    value={value}
                    onChange={(e) => setValue(e.currentTarget.value)}
                    onBlur={onBlur}
                    isInvalid={!isValid}
                    errorMessage={errors[0]}
                    isRequired
                    size="sm"
                  />
                )}
              </Field>
            </div>

            <Field<string>
              name="phoneNumber"
              onBlurValidate={z.string().length(10, "Enter a valid phone number")}
              initialValue={initialValues.phoneNumber ? initialValues.phoneNumber.substring(2) : ""}
            >
              {({ value, setValue, onBlur, isValid, errors }) => (
                <Input
                  label="Phone Number"
                  value={value}
                  onChange={(e) => setValue(e.currentTarget.value)}
                  onBlur={onBlur}
                  isInvalid={!isValid}
                  errorMessage={errors[0]}
                  isRequired
                  size="sm"
                />
              )}
            </Field>

            <Field<string>
              name="email"
              onBlurValidate={z.string().min(1, "Enter an email").email("Enter a valid email")}
              initialValue={initialValues.email}
            >
              {({ value, setValue, onBlur, isValid, errors }) => (
                <Input
                  label="Email"
                  value={value}
                  onChange={(e) => setValue(e.currentTarget.value)}
                  onBlur={onBlur}
                  isInvalid={!isValid}
                  errorMessage={errors[0]}
                  isRequired
                  size="sm"
                />
              )}
            </Field>

            <Field<USER_TYPE>
              name="type"
              initialValue={type || undefined}
              onChangeValidate={z.nativeEnum(USER_TYPE, { errorMap: () => ({ message: "Please select a valid type" }) })}
            >
              {({ value, setValue, errors }) => (
                <Select
                  label="Type"
                  selectedKeys={value ? new Set([value]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys).pop() as USER_TYPE
                    setValue(value);
                    setType(value);
                  }}
                  isInvalid={!!errors.length}
                  errorMessage={errors[0]}
                  isRequired
                >
                  {Object.values(USER_TYPE).map((type) => (
                    <SelectItem key={type}>
                      {enumToStr(type)}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </Field>

            {type === USER_TYPE.STUDENT && (
              <>
                <Divider className="my-2" />
                <Field<COURSE[]>
                  name="interests"
                  initialValue={initialValues.interests || []}
                >
                  {({ value, setValue }) => (
                    <Select
                      label="Interests"
                      selectionMode="multiple"
                      selectedKeys={new Set(value)}
                      onSelectionChange={(keys) => setValue(Array.from(keys) as COURSE[])}
                    >
                      {Object.values(COURSE).map((course) => (
                        <SelectItem key={course}>
                          {enumToStr(course)}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field<string> name="pronouns" initialValue={initialValues.pronouns || ""}>
                  {({ value, setValue }) => (
                    <Input label="Pronouns" value={value} onChange={(e) => setValue(e.currentTarget.value)} size="sm" />
                  )}
                </Field>
                <Field
                  name="birthday"
                  initialValue={initialValues.birthday || undefined}
                >
                  {({ value, setValue }) => (
                    <DatePicker
                      label="Birthday"
                      value={dateToDateValue(value)}
                      onChange={(e: CalendarDate | null) => setValue(e ? e.toDate("EST") : null)}
                      size="sm"
                    />
                  )}
                </Field>
                <Field<CAMPUS> name="school" initialValue={initialValues.school || undefined}>
                  {({ value, setValue }) => (
                    <Select
                      label="School"
                      selectedKeys={value ? new Set([value]) : new Set()}
                      onSelectionChange={(keys) => setValue(Array.from(keys).pop() as CAMPUS)}
                    >
                      {Object.values(CAMPUS).map((campus) => (
                        <SelectItem key={campus}>
                          {campus}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                </Field>
              </>
            )}

            <div className="flex flex-row gap-2 justify-end items-end w-full my-4">
              {onClose && <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>}
              <Button color="primary" isDisabled={!isValid} onPress={submit}>Submit</Button>
            </div>
          </div>
        </>
      )}
    </Form>
  );
};

export default UserForm;
