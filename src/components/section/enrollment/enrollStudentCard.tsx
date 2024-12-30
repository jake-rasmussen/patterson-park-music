import {
  Card,
  CardHeader,
  Divider,
  CardBody,
  DateRangePicker,
  Select,
  SelectItem,
  DateValue,
  RangeValue,
} from "@nextui-org/react";
import { ENROLLMENT_STATUS, User } from "@prisma/client";
import { capitalizeToUppercase } from "~/utils/helper";
import { parseDate } from "@internationalized/date";

type EnrollmentData = {
  dateRange: { start: Date; end: Date } | null;
  status: ENROLLMENT_STATUS | undefined;
};

type PropType = {
  user: User;
  enrollmentData: EnrollmentData;
  updateEnrollmentData: (userId: string, data: Partial<EnrollmentData>) => void;
};

const EnrollStudentCard: React.FC<PropType> = ({ user, enrollmentData, updateEnrollmentData }) => {
  return (
    <Card key={user.id}>
      <CardHeader className="flex gap-4">
        <div className="flex flex-col">
          {user.firstName} {user.lastName}
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-row gap-8">
        <DateRangePicker
          label="Enrollment Duration"
          value={
            enrollmentData.dateRange
              ? {
                start: parseDate(enrollmentData.dateRange.start.toISOString().split("T")[0]!),
                end: parseDate(enrollmentData.dateRange.end.toISOString().split("T")[0]!),
              }
              : null
          }
          onChange={(range) =>
            updateEnrollmentData(user.id, {
              dateRange: range
                ? {
                  start: new Date(range.start.toString()),
                  end: new Date(range.end.toString()),
                }
                : null,
            })
          }
          variant="underlined"
          className="max-w-xs mb-4"
        />
        <Select
          label="Enrollment Status"
          selectedKeys={
            enrollmentData.status ? new Set([enrollmentData.status]) : new Set()
          }
          onSelectionChange={(keys) =>
            updateEnrollmentData(user.id, {
              status: Array.from(keys).pop() as ENROLLMENT_STATUS,
            })
          }
          className="max-w-xs"
          variant="underlined"
        >
          {Object.values(ENROLLMENT_STATUS).map((enrollmentStatus) => (
            <SelectItem key={enrollmentStatus} value={enrollmentStatus}>
              {capitalizeToUppercase(enrollmentStatus)}
            </SelectItem>
          ))}
        </Select>
      </CardBody>
    </Card>
  );
};

export default EnrollStudentCard;
