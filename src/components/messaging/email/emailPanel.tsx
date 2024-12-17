import { Contact } from "@prisma/client";
import EmailView from "./emailView";
import { Divider } from "@nextui-org/react";
import EmailMessageBar from "./emailBar";
import { IconMailX } from "@tabler/icons-react";

type PropType = {
  selectedContact: Contact;
}

const EmailPanel = (props: PropType) => {
  const { selectedContact } = props;

  return (
    <>
      {
        selectedContact.email ? <>
          <div className="flex-1 min-h-0 overflow-auto bg-gray-50 relative">
            <EmailView selectedContact={selectedContact} email={selectedContact.email} />
          </div>

          <div className="w-full bg-white rounded-br-xl">
            <Divider />
            <div className="p-4">
              <EmailMessageBar to={[selectedContact.email]} />
            </div>
          </div>
        </> : <div className="flex flex-col h-full justify-center items-center gap-4">
          <IconMailX className="h-20 w-20" />
        </div>
      }
    </>
  )

}

export default EmailPanel;