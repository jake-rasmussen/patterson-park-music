import { Divider } from "@nextui-org/react";
import { Family, User, USER_TYPE } from "@prisma/client";
import { IconSchool, IconUser } from "@tabler/icons-react";

type PropType = {
  users: (User & {
    family: Family | null
  })[];
  selectedUser: (User & {
    family: Family | null
  });
}

const StudentInfo = (props: PropType) => {
  const { users, selectedUser } = props;

  return (
    <>
      <div className="text-left flex flex-col gap-2 items-start w-full">
        <span className="text-lg flex gap-2"><IconUser />Parent(s)</span>
        <Divider />
        {
          users.filter((user) => user.familyId === selectedUser.familyId).length > 0 ? (
            users
              .filter((user) =>
                user.familyId === selectedUser.familyId &&
                user.id !== selectedUser.id &&
                user.type !== USER_TYPE.STUDENT
              ).map((child) => (
                <div key={child.id} className="flex flex-row items-center gap-2">
                  <span>{child.firstName} {child.lastName}</span>
                </div>
              ))
          ) : (
            <p className="text-gray-500">No parents found.</p>
          )
        }
      </div>

      {
        users.filter((user) => user.familyId === selectedUser.familyId).length > 0 && (
          <>
            <div className="text-left flex flex-col gap-2 items-start w-full">
              <span className="text-lg flex gap-2"><IconSchool />Other Student(s)</span>
              <Divider />

              {
                users
                  .filter((user) =>
                    user.familyId === selectedUser.familyId &&
                    user.id !== selectedUser.id &&
                    user.type !== USER_TYPE.PARENT
                  ).map((child) => (
                    <div key={child.id} className="flex flex-row items-center gap-2">
                      <span>{child.firstName} {child.lastName}</span>
                    </div>
                  )
                  )}
            </div>
          </>
        )}
    </>
  )
}

export default StudentInfo;