import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@nextui-org/react";
import { IconEdit } from "@tabler/icons-react";
import { Field, Form } from "houseform";
import toast from "react-hot-toast";
import z from "zod";
import { api } from "~/utils/api";
import Error from "next/error";
import { Contact } from "@prisma/client";
import ContactCard from "~/components/contact/contactCard";

export default function ContactPage() {
  const { data: contacts, isLoading: isLoadingContacts, error: errorContacts } = api.contact.getAllContacts.useQuery({
    skip: 0,
    take: 20,
  });

  const createContact = api.contact.createContact.useMutation({
    onSuccess() {
      toast.success("Created Contact!");
    },
    onError() {
      toast.error("Error...");
    }
  });

  if (errorContacts) {
    return <Error
      statusCode={
        errorContacts?.data?.httpStatus ||
        500
      }
    />
  } else {
    return (
      <main className="flex flex-row gap-8 h-full">
        <section className="grow bg-white h-full rounded-xl flex flex-col gap-8 p-8">
          <h2 className="text-xl text-center">Contact List</h2>
          <Divider />
          <div className="h-full">
            {
              isLoadingContacts ? <div className="w-full h-full flex justify-center items-center">
                <Spinner label="Loading..." className="m-auto" />
              </div> : <div className="flex flex-wrap gap-4 px-20 items-center justify-center">
                {contacts?.map((contact: Contact) => <ContactCard contact={contact} />)}
              </div>
            }
          </div>
        </section>

        <section className="bg-white rounded-xl h-fit flex flex-col gap-8 p-8 min-w-96">
          <h2 className="text-xl text-center">Create Contact</h2>
          <Divider />
          <div>
            <Form
              onSubmit={(values) => {
                createContact.mutateAsync({
                  firstName: values.first,
                  lastName: values.last,
                  phoneNumber: values.phone,
                  email: values.email,
                });
              }}
            >
              {({ isValid, submit, reset }) => (
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

                    <div className="flex flex-row justify-end items-end w-full mt-8">
                      <Button color="primary" isDisabled={!isValid} onPress={submit}>
                        Submit
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Form>
          </div>
        </section>
      </main>
    )
  }
}