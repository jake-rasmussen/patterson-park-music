import { Divider } from "@heroui/react";
import { Enrollment, Family, User, USER_TYPE } from "@prisma/client";
import { IconSchool, IconUser } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

type PropType = {
  users: (User & { family: Family | null; enrollment: Enrollment[] })[];
  selectedUser: User & { family: Family | null; enrollment: Enrollment[] };
  setSelectedUser: Dispatch<SetStateAction<(User & { family: Family | null; enrollment: Enrollment[] }) | undefined>>;
};

const ParentInfo = (props: PropType) => {
  const { users, selectedUser, setSelectedUser } = props;

  const familyMembers = users.filter((user) => user.familyId === selectedUser.familyId);
  const children = familyMembers.filter((user) => user.type === USER_TYPE.STUDENT && user.id !== selectedUser.id);
  const fellowParents = familyMembers.filter((user) => user.type === USER_TYPE.PARENT && user.id !== selectedUser.id);

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        <span className="text-lg flex gap-2">
          <IconSchool /> Children
        </span>
        <Divider />
        {children.length > 0 ? (
          children.map((child) => (
            <button key={child.id} className="flex flex-row items-center gap-2 group" onClick={() => setSelectedUser(child)}>
              <span className="group-hover:text-gray-500 transition duration-300 ease-in-out">{child.firstName} {child.lastName}</span>
            </button>
          ))
        ) : (
          <p className="text-gray-500 text-left">No children found.</p>
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        <span className="text-lg flex gap-2">
          <IconUser /> Fellow Parent(s)
        </span>
        <Divider />
        {fellowParents.length > 0 ? (
          fellowParents.map((parent) => (
            <button key={parent.id} className="flex flex-row items-center gap-2 group" onClick={() => setSelectedUser(parent)}>
              <span className="group-hover:text-gray-500 transition duration-300 ease-in-out">{parent.firstName} {parent.lastName}</span>
            </button>
          ))
        ) : (
          <p className="text-gray-500">No fellow parents found.</p>
        )}
      </div>
    </>
  );
};

export default ParentInfo;