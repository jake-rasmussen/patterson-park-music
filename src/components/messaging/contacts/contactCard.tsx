import { ButtonGroup } from "@nextui-org/button";
import { Family, User, USER_TYPE } from "@prisma/client";
import { IconSchool, IconUser, IconApple, IconPin, IconArchive, IconPinFilled } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import UserIcon from "~/components/user/userIcon";
import { api } from "~/utils/api";

type PropType = {
  user: (User & {
    family: Family | null
  });
  setSelectedUser: Dispatch<SetStateAction<(User & { family: Family | null }) | undefined>>;
  updateUserState: (updatedUser: User) => void;
};

const ContactCard = (props: PropType) => {
  const { user, setSelectedUser, updateUserState } = props;

  const updateUser = api.user.updateUser.useMutation();

  return (
    <ButtonGroup
      className="w-full hover:bg-[#EEEEEF] px-4 rounded-xl transition duration-300 ease-in-out group"
      variant="light"
    >
      <button
        className="w-full h-full min-h-[4rem] min-w-[8rem] py-4 flex justify-start bg-transparent"
        onClick={() => {
          setSelectedUser(user);

          if (user.unreadMessage) {
            user.unreadMessage = false;
            updateUserState(user);
            updateUser.mutate({ id: user.id, unreadMessage: user.unreadMessage })
          }
        }}
      >
        <div className="flex flex-row h-full items-center gap-2">
          <UserIcon userType={user.type} />

          <div className="flex flex-col items-start text-black">
            <span className="text-small">{user.firstName}</span>
            <span className="text-tiny text-default-500">{user.lastName}</span>
          </div>
        </div>
      </button>
      <div className="grow items-end justify-end flex flex-row gap-2 z-10 relative">
        <button
          onClick={() => {
            user.isArchived = !user.isArchived;
            updateUserState(user);
            updateUser.mutate({ id: user.id, isArchived: user.isArchived });
          }}
          className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 ease-in-out"
        >
          {user.isArchived ? (
            <IconArchive className="transition-transform duration-300 ease-in-out hover:scale-125 text-red-500 hover:text-black" />
          ) : (
            <IconArchive className="transition-transform duration-300 ease-in-out hover:scale-125 hover:text-red-500" />
          )}
        </button>

        <button
          onClick={() => {
            user.isPinned = !user.isPinned;
            updateUserState(user);
            updateUser.mutate({ id: user.id, isPinned: user.isPinned });
          }}
          className={`${!user.isPinned && "invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 ease-in-out z-10"}`}
        >
          {user.isPinned ? (
            <IconPin className="transition-transform duration-300 ease-in-out hover:scale-125 text-blue-500 hover:text-black" />
          ) : (
            <IconPin className="transition-transform duration-300 ease-in-out hover:scale-125 hover:text-blue-500" />
          )}
        </button>

        {
          user.unreadMessage && (
            <div className={`absolute right-0 -translate-x-1/2 top-1/2 -translate-y-1/2 ${user.isPinned && "mr-8 z-0"}`}>
              <span className="flex h-3 w-3 visible opacity-100 group-hover:invisible group-hover:opacity-0 transition-all duration-300 ease-in-out">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            </div>
          )
        }
      </div>
    </ButtonGroup>
  );
};

export default ContactCard;
