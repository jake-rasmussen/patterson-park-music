import { Divider, Tooltip } from "@nextui-org/react";
import { User, Status } from "@prisma/client";
import { formatTime } from "~/utils/helper";
import MessageImageModal from "./messageImageModal";
import { IconExclamationCircle } from "@tabler/icons-react";

type PropType = {
  status: Status;
  body: string;
  subject?: string;
  dateSent: Date;
  contact: User;
  imageUrls: string[] | null; // Optional prop for the image URL
  type: "email" | "sms";
  errorCode?: number;
}

const MessageBubble = (props: PropType) => {
  const { status, body, subject, dateSent, contact, imageUrls, type, errorCode } = props;

  return (
    <>
      <div className={status === Status.RECEIVED ? `w-full flex items-end justify-end text-right` : ""}>
        <div className="flex items-start gap-2.5">
          {errorCode && errorCode !== 202 && errorCode !== 200 && (
            <div className="h-full my-auto">
              <Tooltip color="danger" content={"Error Code: " + errorCode} placement="bottom">
                <IconExclamationCircle className="text-red-500" />
              </Tooltip>
            </div>
          )}
          <div className={`flex flex-col leading-1.5 p-4 rounded-l-xl rounded-br-xl bg-gray-800 shadow-xl ${type === "email" ? "max-w-[30rem] " : "max-w-[20rem]"}`}>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white w-full">
                {status === Status.RECEIVED ? `${contact.firstName} ${contact.lastName}` : "Patterson Park Music"}
              </span>
              <span className="text-sm font-normal text-gray-400 text-nowrap">
                {formatTime(dateSent)}
              </span>
            </div>
            {type === "email" && subject && <div className="mt-2">
              <p className="text-white text-lg">{subject}</p>
              <Divider className="bg-white" />
            </div>}
            <div className="text-sm font-normal py-2.5 text-white" dangerouslySetInnerHTML={{ __html: body }} />
            {imageUrls && (
              <>
                {
                  imageUrls.map((imageUrl) => <MessageImageModal imageUrl={imageUrl} />)
                }
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageBubble;