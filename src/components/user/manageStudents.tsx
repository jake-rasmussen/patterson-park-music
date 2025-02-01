import { Family, User } from "@prisma/client";
import { Divider, Spinner } from "@nextui-org/react";
import StudentTable from "./studentTable";

type PropType = {
  users: (User & {
    family: Family | null
  })[];
  isLoading: boolean;
}

const ManageStudents = (props: PropType) => {
  const { users, isLoading } = props;

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <h2 className="text-xl text-center">Student Roster</h2>
      <Divider />
      <div className="h-full">
        {
          isLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <Spinner label="Loading..." className="m-auto" />
            </div>
          ) : (
            <div className="flex flex-col gap-8 items-center w-full justify-center">
              <div className="w-full flex flex-col gap-4">
                <StudentTable
                  users={users}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

export default ManageStudents;