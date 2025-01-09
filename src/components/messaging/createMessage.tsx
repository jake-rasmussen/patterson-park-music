import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { IconEdit } from "@tabler/icons-react";
import { Field, Form } from "houseform";
import toast from "react-hot-toast";
import z from "zod";
import { api } from "~/utils/api";

const CreateMessage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const createContact = api.user.createUser.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Created Contact!");
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    }
  })

  return (
    <>
      <button onClick={onOpen}>
        <IconEdit
          className="w-10 h-10 transition duration-300 ease-in-out hover:scale-110 hover:cursor-pointer"
        />
      </button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Enter Contact Details</ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <Form
                  onSubmit={async (values) => {
                    await createContact.mutateAsync({
                      firstName: values.first,
                      lastName: values.last,
                      phoneNumber: values.phone,
                      email: values.email,
                    })
                    
                    onClose();
                  }}
                >
                  {({ isValid, submit }) => (
                    <>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-row gap-4">
                          <Field<string>
                            name="first"
                            onChangeValidate={z
                              .string()
                              .min(1, "Enter your first name")}
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
                            onChangeValidate={z
                              .string()
                              .min(1, "Enter your last name")}
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
                          onChangeValidate={z
                            .string()
                            .min(10, "Enter a valid phone number")
                            .max(15, "Enter a valid phone number")}
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
                      </div>

                      <ModalFooter className="px-0 py-4">
                        <Button color="danger" variant="light" onPress={onClose}>
                          Cancel
                        </Button>
                        <Button color="primary" isDisabled={!isValid} onPress={submit}>
                          Submit
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateMessage;
