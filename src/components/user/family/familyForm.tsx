import { Button } from "@heroui/button";
import { Input, Select, SelectSection, SelectItem } from "@heroui/react";
import { Field, Form } from "houseform";
import { z } from "zod";
import { CAMPUS, Family, User } from "@prisma/client";
import { enumToStr } from "~/utils/helper";

type PropType = {
  handleSubmit: (values: Record<string, any>) => Promise<void>;
  onClose?: () => void;
  initialValues?: Partial<Record<string, any>>;
  users: (User & {
    family: Family | null
  })[];
  selectedUserIds?: string[];
};

const FamilyForm = (props: PropType) => {
  const { handleSubmit, onClose, initialValues = {}, users, selectedUserIds = [] } = props;

  const usersByType = users.reduce<Record<string, User[]>>(
    (acc, user) => {
      acc[user.type] = acc[user.type] || [];
      acc[user.type]?.push(user);
      return acc;
    },
    {}
  );

  return (
    <Form
      onSubmit={async (values) => {
        handleSubmit(values);
      }}
    >
      {({ isValid, submit }) => (
        <>
          <div className="flex flex-col gap-4">
            <Field<string>
              name="familyName"
              onChangeValidate={z.string().min(1, "Family name is required")}
              initialValue={initialValues.familyName}
            >
              {({ value, setValue, onBlur, isValid, errors }) => (
                <Input
                  label="Family Name"
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

            <Field<CAMPUS> name="campus" initialValue={initialValues.campus}>
              {({ value, setValue }) => (
                <Select
                  label="Campus"
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

            <Field<string>
              name="doorCode"
              onChangeValidate={z.string().min(1, "Door code is required")}
              initialValue={initialValues.doorCode}
            >
              {({ value, setValue, errors }) => (
                <Input
                  label="Door Code"
                  value={value}
                  onChange={(e) => setValue(e.currentTarget.value)}
                  isInvalid={!isValid}
                  errorMessage={errors[0]}
                  isRequired
                  size="sm"
                />
              )}
            </Field>

            <Field<string[]>
              name="userIds"
              onChangeValidate={z.array(z.string()).nonempty("Select at least one user")}
              initialValue={selectedUserIds}
            >
              {({ value, setValue, errors, isValid }) => (
                <Select
                  label="Users"
                  selectionMode="multiple"
                  selectedKeys={new Set(value)}
                  onSelectionChange={(keys) =>
                    setValue(Array.from(keys) as string[])
                  }
                  renderValue={() => {
                    const selectedUsers = users.filter((user) =>
                      Array.from(value).includes(user.id)
                    );
                    return selectedUsers
                      .map((user) => `${user.firstName} ${user.lastName}`)
                      .join(", ");
                  }}
                  isInvalid={!isValid}
                  errorMessage={errors[0]}
                  isRequired
                >
                  {Object.entries(usersByType).map(([type, users]) => (
                    <SelectSection key={type} title={type}>
                      {users.map((user) => (
                        <SelectItem key={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectSection>
                  ))}
                </Select>
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
        </>
      )}
    </Form>
  );
};

export default FamilyForm;
