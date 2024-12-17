import { Contact } from "@prisma/client";
import { Divider } from "@nextui-org/react";
import { IconMailX, IconMessageX } from "@tabler/icons-react";
import SMSView from "./smsView";
import SMSMessageBar from "./smsBar";

type PropType = {
  selectedContact: Contact;
}

const SMSPanel = (props: PropType) => {
  const { selectedContact } = props;

  return (<>
    {
      selectedContact.phoneNumber ? <>
        <div className="flex-1 min-h-0 overflow-auto bg-gray-50 relative">
          <SMSView selectedContact={selectedContact} />
        </div>

        <div className="w-full bg-white rounded-br-xl">
          <Divider />
          <div className="p-4">
            <SMSMessageBar to={selectedContact.phoneNumber} />
          </div>
        </div>
      </> : <div className="flex flex-col h-full justify-center items-center gap-4">
        <IconMessageX className="h-20 w-20" />
      </div>
    }
  </>);
}

export default SMSPanel;