import { Divider } from "@nextui-org/react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import SectionForm from "./sectionForm";
import { User } from "@prisma/client";

type PropType = {
  teachers: User[];
}

const CreateSection = (props: PropType) => {
  const { teachers } = props;

  const utils = api.useUtils();

  const createSection = api.section.createSection.useMutation({
    onSuccess() {
      toast.dismiss();
      toast.success("Created Section!");

      utils.section.getAllSections.invalidate();
    },
    onError() {
      toast.dismiss();
      toast.error("Error...");
    },
  });

  const handleSubmit = async (values: Record<string, any>) => {
    toast.loading("Creating section...");

    const currentDate = new Date();
    const [hours, minutes] = values.startTime.split(":").map(Number);
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hours,
      minutes
    );

    try {
      await createSection.mutateAsync({
        teacherId: values.teacherId,
        course: values.course,
        semesters: values.semesters,
        weekdays: values.weekdays,
        startTime: date,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (<>
    <h2 className="text-xl text-center">Create Section</h2>
    <Divider />
    <div>
      <SectionForm handleSubmit={handleSubmit} teachers={teachers} />
    </div>
  </>);

}

export default CreateSection;