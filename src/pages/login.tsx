import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Field, Form } from "houseform";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import z from "zod";
import Layout from "~/layouts/layout";
import { createClient } from "~/utils/supabase/client/component";

const LoginPage = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const router = useRouter();
  const supabaseClient = createClient();

  const handleSubmit = async (values: Record<string, string>) => {
    toast.loading("Logging in...");

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: values.email || "",
        password: values.password || "",
      });

      if (error) {
        toast.dismiss();

        if (error.code === "invalid_credentials") {
          toast.dismiss();
          toast.error("Incorrect email or password");
        } else {
          toast.dismiss();
          toast.error("Error...");
        }
      } else {
        toast.dismiss();
        toast.success("Logged in successfully!");

        window.location.href = "/"; // Trigger full reload
      }

    } catch (_) {
      toast.dismiss();
      toast.error("Error...")
    }
  };

  return (
    <Modal
      size="xl"
      isOpen={true}
      backdrop="opaque"
      classNames={{
        backdrop: "bg-gray-900 h-screen w-screen flex items-center justify-center",
      }}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader>Login</ModalHeader>
        <Form
          onSubmit={async (values) => {
            handleSubmit(values);
          }}
        >
          {({ submit }) => (
            <>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Field
                    name="email"
                    onBlurValidate={z
                      .string()
                      .min(1, "Enter an email")
                      .email("Enter a valid email")}
                    initialValue=""
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
                        autoComplete="off"
                        size="lg"
                      />
                    )}
                  </Field>

                  <Field<string>
                    name="password"
                    onChangeValidate={z.string().min(1, "Enter your password")}
                    initialValue=""
                  >
                    {({ value, setValue, onBlur, isValid, errors }) => (
                      <Input
                        label="Password"
                        value={value}
                        type={isVisible ? "text" : "password"}
                        onChange={(e) => setValue(e.currentTarget.value)}
                        onBlur={onBlur}
                        isInvalid={!isValid}
                        errorMessage={errors[0]}
                        isRequired
                        endContent={
                          <div className="h-full w-full flex justify-end">
                            <button
                              className="focus:outline-none pt-1"
                              type="button"
                              onClick={toggleVisibility}
                            >
                              {isVisible ? (
                                <IconEyeOff className="h-full text-gray-500" />
                              ) : (
                                <IconEye className="h-full text-gray-500" />
                              )}
                            </button>
                          </div>
                        }
                        autoComplete="off"
                        size="lg"
                      />
                    )}
                  </Field>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={submit}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </Form>
      </ModalContent>
    </Modal>
  );
}

LoginPage.getLayout = (page: React.ReactElement, isAuthenticated: boolean) => (
  <Layout>{page}</Layout>
);

export default LoginPage;