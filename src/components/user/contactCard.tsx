import { Card } from "@heroui/react";
import type { User } from "@prisma/client";
import UserIcon from "./userIcon";

type PropType = {
  contact: User;
}

const ContactCard = (props: PropType) => {
  const {
    contact
  } = props;

  return (
    <Card
      className="p-8 transition duration-300 ease-in-out hover:bg-gray-200 hover:cursor-pointer w-60"
    >
      <div className="flex flex-row h-full items-center gap-2">
        <UserIcon userType={contact.type} />
        <div className="flex flex-col items-start text-black">
          <span className="text-lg">{contact.firstName}</span>
          <span className="text-md text-default-500">{contact.lastName}</span>
        </div>
      </div>
    </Card>
  );

}

export default ContactCard;