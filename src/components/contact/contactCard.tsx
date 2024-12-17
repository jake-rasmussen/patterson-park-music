import { Button, Card } from "@nextui-org/react";
import { Contact } from "@prisma/client";
import { IconUser } from "@tabler/icons-react";

type PropType = {
  contact: Contact;
}

const ContactCard = (props: PropType) => {
  const {
    contact
  } = props;

  return (
    <Card
      className="p-8 px-16 transition duration-300 ease-in-out hover:bg-gray-200 hover:cursor-pointer"
    >
      <div className="flex flex-row h-full items-center gap-2">
        <IconUser className="rounded-full h-full w-auto" />
        <div className="flex flex-col items-start text-black">
          <span className="text-lg">{contact.firstName}</span>
          <span className="text-md text-default-500">{contact.lastName}</span>
        </div>
      </div>
    </Card>
  );

}

export default ContactCard;