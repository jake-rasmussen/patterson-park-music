import { Divider } from "@nextui-org/react";
import { Family, User } from "@prisma/client";
import { IconSchool } from "@tabler/icons-react";

type PropType = {
  users: (User & {
    family: Family | null
  })[];
  selectedUser: (User & {
    family: Family | null
  });
}

const ParentInfo = (props: PropType) => {
  const { users, selectedUser } = props;

  return (
    <div className="text-left flex flex-col gap-2 items-start w-full">
      <span className="text-lg flex gap-2"><IconSchool />Children</span>
      <Divider />
      {
        users.filter((user) => user.familyId === selectedUser.familyId).length > 0 ? (
          users
            .filter((user) => user.familyId === selectedUser.familyId && user.id !== selectedUser.id)
            .map((child) => (
              <div key={child.id} className="flex flex-row items-center gap-2">
                <span>{child.firstName} {child.lastName}</span>
              </div>
            ))
        ) : (
          <p className="text-gray-500">No children found.</p>
        )
      }
    </div>
  )
}

export default ParentInfo;