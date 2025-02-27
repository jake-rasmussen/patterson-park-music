import { Divider, Spinner } from "@heroui/react";
import { Family, User, USER_TYPE } from "@prisma/client";
import { IconSchool, IconUser } from "@tabler/icons-react";
import { api } from "~/utils/api";
import { enumToStr, formatTime, joinEnums } from "~/utils/helper";

type PropType = {
  selectedUser: (User & {
    family: Family | null
  });
}

const TeacherInfo = (props: PropType) => {
  const { selectedUser } = props;

  const {
    data: sections,
    isLoading,
  } = api.section.getSectionByTeacherId.useQuery(selectedUser.id);

  return (
    <>
      <div className="text-left flex flex-col gap-2 items-start w-full">
        <span className="text-lg flex gap-2"><IconUser />Sections(s)</span>
        <Divider />
        {
          isLoading ? (
            <div className="w-full h-full flex justify-center items-center py-4">
              <Spinner label="Loading..." className="m-auto" />
            </div>
          ) : (
            <div className="p-2">
              {
                (sections || []).length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {
                      sections?.map((section) => (
                        <div className="flex flex-col gap-2">
                          <div key={section.id} className="flex flex-row items-center gap-2">
                            <span className="text-lg">{enumToStr(section.course)}</span>
                          </div>

                          <p className="text-gray-500 text-xs">
                            <span className="underline text-black">Day(s):</span> {joinEnums(section.weekdays)}
                          </p>
                          <p className="text-gray-500 text-xs">
                          <span className="underline text-black">Start Time:</span> {formatTime(section.startTime)}
                          </p>
                          <p className="text-gray-500 text-xs">
                          <span className="underline text-black">Semester(s):</span> {joinEnums(section.semesters)}
                          </p>
                        </div>

                      ))
                    }
                  </div>
                ) : (
                  <p className="text-gray-500">No sections found.</p>
                )
              }
            </div>
          )
        }
      </div>
    </>
  )
}

export default TeacherInfo;