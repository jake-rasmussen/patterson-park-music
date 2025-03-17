import { USER_TYPE } from "@prisma/client";
import { IconSchool, IconUser, IconApple, IconQuestionMark } from "@tabler/icons-react";

type PropType = {
  userType: USER_TYPE;
  className?: string;
}

const UserIcon = (props: PropType) => {
  const { userType, className } = props;

  return (
    <div className={`${className}`}>
      {
        userType === USER_TYPE.STUDENT ? (
          <IconSchool className="rounded-full h-full w-auto" />
        ) : userType === USER_TYPE.PARENT ? (
          <IconUser className="rounded-full h-full w-auto" />
        ) : userType === USER_TYPE.TEACHER ? (
          <IconApple className="rounded-full h-full w-auto" />
        ) : (
          <IconQuestionMark className="rounded-full h-full w-auto" />
        )
      }
    </div>
  )
}

export default UserIcon;