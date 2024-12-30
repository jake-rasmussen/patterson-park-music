import { Divider } from "@nextui-org/react";
import UserForm from "./userForm";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

type PropType = {
  isTeacher?: boolean;
}

const CreateUser = (props: PropType) => {
  const { isTeacher = false } = props;

  const utils = api.useUtils();

  const createUser = api.user.createUser.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Successfully created user!");

      utils.user.getAllUsers.invalidate();
      utils.user.getAllTeachers.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    }
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Creating user...");

    await createUser.mutateAsync({
      firstName: values.first,
      lastName: values.last,
      phoneNumber: values.phone,
      email: values.email,
      isTeacher: isTeacher ? isTeacher : false,
    });
  }

  return (<>
    <h2 className="text-xl text-center">Create {isTeacher ? "Teacher" : "Student"}</h2>
    <Divider />
    <div>
      <UserForm handleSubmit={handleSubmit} />
    </div>
  </>)

}

export default CreateUser;