import { useState } from "react";
import MessageBar from "./emailBar";
import { api } from "~/utils/api";
import { Contact } from "@prisma/client";

type PropType = {
  selectedContact: Contact;
}

const EmailView = (props: PropType) => {
  const {
    selectedContact
  } = props;

  return (<>
    <div className="p-4">
      <MessageBar to={selectedContact.email} />
    </div>
  </>);

}

export default EmailView;