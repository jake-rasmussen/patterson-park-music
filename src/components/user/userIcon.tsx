import { user } from "@heroui/theme";
import { USER_TYPE } from "@prisma/client";
import { IconSchool, IconUser, IconApple, IconQuestionMark } from "@tabler/icons-react";

type PropType = {
  userType: USER_TYPE;
}

const UserIcon = (props: PropType) => {
  const { userType } = props;

  return (
    <>
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
    </>
  )
}

export default UserIcon;