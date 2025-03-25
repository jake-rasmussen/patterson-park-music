import { Divider, Spinner } from "@heroui/react";
import { Family, User, USER_TYPE } from "@prisma/client";
import { IconCalendar, IconClock, IconSchool, IconTimelineEventText, IconUser } from "@tabler/icons-react";
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
        <span className="text-lg flex gap-2"><IconUser />Section(s)</span>
        <Divider />
        {
          isLoading ? (
            <div className="w-full h-full flex justify-center items-center py-4">
              <Spinner label="Loading..." className="m-auto" />
            </div>
          ) : (
            <>
              {
                (sections || []).length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {
                      sections?.map((section) => (
                        <div className="flex flex-col gap-2">
                          <div key={section.id} className="flex flex-row items-center gap-2">
                            <span className="text-lg">{enumToStr(section.course)}</span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <IconCalendar className="min-w-6" />
                              <span>
                                <strong>Day(s):</strong> {joinEnums(section.weekdays)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IconClock className="min-w-6" />
                              <span><strong>Start Time:</strong> {formatTime(section.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IconTimelineEventText className="min-w-6" />
                              <span><strong>Semester(s):</strong> {joinEnums(section.semesters)}</span>
                            </div>
                          </div>
                        </div>

                      ))
                    }
                  </div>
                ) : (
                  <p className="text-gray-500">No sections found.</p>
                )
              }
            </>
          )
        }
      </div>
    </>
  )
}

export default TeacherInfo;