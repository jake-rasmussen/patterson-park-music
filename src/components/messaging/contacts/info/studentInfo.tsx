import { Divider } from "@heroui/react";
import { Family, User, USER_TYPE, COURSE, CAMPUS, Enrollment } from "@prisma/client";
import { IconSchool, IconUser, IconBook, IconCake, IconTextSize, IconMessageCircleUser } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import { enumToStr } from "~/utils/helper";

type PropType = {
  users: (User & { family: Family | null; enrollment: Enrollment[] })[];
  selectedUser: User & { family: Family | null; enrollment: Enrollment[] };
  setSelectedUser: Dispatch<SetStateAction<(User & { family: Family | null; enrollment: Enrollment[] }) | undefined>>;
};

const StudentInfo = (props: PropType) => {
  const { users, selectedUser, setSelectedUser } = props;

  const familyMembers = users.filter((user) => user.familyId === selectedUser.familyId);
  const parents = familyMembers.filter((user) => user.type !== USER_TYPE.STUDENT && user.id !== selectedUser.id);
  const otherStudents = familyMembers.filter((user) => user.type === USER_TYPE.STUDENT && user.id !== selectedUser.id);

  return (
    <>
      <div className="text-left flex flex-col gap-2 items-start w-full">
        <span className="text-lg flex gap-2">
          <IconUser /> Parent(s)
        </span>
        <Divider />
        {parents.length > 0 ? (
          parents.map((parent) => (
            <button key={parent.id} className="flex flex-row items-center gap-2 group" onClick={() => setSelectedUser(parent)}>
              <span className="group-hover:text-gray-500 transition duration-300 ease-in-out">{parent.firstName} {parent.lastName}</span>
            </button>
          ))
        ) : (
          <p className="text-gray-500">No parents found.</p>
        )}
      </div>

      <div className="text-left flex flex-col gap-2 items-start w-full">
        <span className="text-lg flex gap-2">
          <IconUser /> Student Details
        </span>
        <Divider />

        {selectedUser.pronouns && (
          <div className="flex items-center gap-2">
            <IconMessageCircleUser className="min-w-8" />
            <span><strong >Pronouns:</strong> {selectedUser.pronouns}</span>
          </div>
        )}

        {selectedUser.birthday && (
          <div className="flex items-center gap-2">
            <IconCake className="min-w-8" />
            <span><strong>Birthday:</strong> {new Date(selectedUser.birthday).toLocaleDateString()}</span>
          </div>
        )}

        {selectedUser.school && (
          <div className="flex items-center gap-2">
            <IconSchool className="min-w-8" />
            <span><strong>School:</strong> {selectedUser.school}</span>
          </div>
        )}

        {selectedUser.interests && selectedUser.interests.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <IconBook className="min-w-8" />
              <span><strong>Interests:</strong></span>
            </div>
            <ul className="ml-6 list-disc text-gray-700">
              {selectedUser.interests.map((interest) => (
                <li key={interest}>{enumToStr(interest)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>


      {/* Other Students Section */}
      {otherStudents.length > 0 && (
        <div className="text-left flex flex-col gap-2 items-start w-full mt-4">
          <span className="text-lg flex gap-2">
            <IconSchool /> Other Student(s)
          </span>
          <Divider />
          {otherStudents.map((student) => (
            <button key={student.id} className="flex flex-row items-center gap-2 group" onClick={() => setSelectedUser(student)}>
              <span className="group-hover:text-gray-500 transition duration-300 ease-in-out">{student.firstName} {student.lastName}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default StudentInfo;
