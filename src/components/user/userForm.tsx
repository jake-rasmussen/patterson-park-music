import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import { Field, Form } from "houseform";
import { z } from "zod";

type PropType = {
  handleSubmit: (values: Record<string, any>) => Promise<void>;
  onClose?: () => void;
  initialValues?: Partial<Record<string, any>>; // Optional initial values
  isTeacher?: boolean;
}

const UserForm = (props: PropType) => {
  const { handleSubmit, onClose, initialValues = {}, isTeacher } = props;


  return (
    <Form
      onSubmit={async (values, { reset }) => {
        handleSubmit(values);
        reset();
      }}
    >
      {({ isValid, submit }) => (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <Field<string>
                name="first"
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
                  />
                )}
              </Field>

              <Field<string>
                name="last"
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
                  />
                )}
              </Field>
            </div>

            <Field<string>
              name="phone"
              onChangeValidate={z.string().length(10, "Enter a valid phone number")}
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
                />
              )}
            </Field>

            <Field
              name="email"
              onBlurValidate={z
                .string()
                .min(1, "Enter an email")
                .email("Enter a valid email")}
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
        </>
      )}
    </Form>
  );

}

export default UserForm;