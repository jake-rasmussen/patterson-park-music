import { Spinner, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { api } from "~/utils/api";
import { Section, Enrollment, ENROLLMENT_STATUS } from "@prisma/client";
import { IconEye } from "@tabler/icons-react";
import { capitalizeToUppercase } from "~/utils/helper";

const EnrollmentDropdown = ({ enrollments }: { enrollments: Enrollment[] }) => {
  const sectionIds = enrollments.map((enrollment) => enrollment.sectionId);

  const { data: sections, isLoading } = api.section.getSectionsByIds.useQuery(
    { ids: sectionIds },
    { enabled: sectionIds.length > 0 }
  );

  const mergedEnrollments = enrollments.map((enrollment) => {
    const section = sections?.find((s: Section) => s.id === enrollment.sectionId);

    return {
      key: enrollment.id,
      course: section?.course || "Unknown Course",
      startDate: new Date(Date.UTC(
        enrollment.startDate.getUTCFullYear(),
        enrollment.startDate.getUTCMonth(),
        enrollment.startDate.getUTCDate()
      )),
      endDate: new Date(Date.UTC(
        enrollment.endDate.getUTCFullYear(),
        enrollment.endDate.getUTCMonth(),
        enrollment.endDate.getUTCDate()
      )),
      status: enrollment.status as ENROLLMENT_STATUS,
      teacher: section?.teacher,
    };
  });

  const formatUTCDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="flat" endContent={<IconEye />}>
          View
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="View Enrollments">
        {isLoading ? (
          <DropdownItem key="loading" isReadOnly>
            <div className="w-full flex justify-center items-center py-2">
              <Spinner size="sm" color="primary" label="Loading..." />
            </div>
          </DropdownItem>
        ) : mergedEnrollments.length > 0 ? (
          mergedEnrollments.map((item, index) => (
            <DropdownItem key={item.key} className="py-2" isReadOnly showDivider={index !== mergedEnrollments.length - 1}>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-md">{capitalizeToUppercase(item.course)} with {item.teacher?.firstName}</span>
                <span className="text-sm text-gray-500">
                  {formatUTCDate(item.startDate)} → {formatUTCDate(item.endDate)}
                </span>
                <span className="text-sm font-semibold text-gray-500">
                  {capitalizeToUppercase(item.status)}
                </span>
              </div>
            </DropdownItem>
          ))
        ) : (
          <DropdownItem key="empty">
            No enrollments found.
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

export default EnrollmentDropdown;
