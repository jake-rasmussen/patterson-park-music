import { Contact } from "@prisma/client";
import { formatTime } from "~/utils/helper";

type PropType = {
  status: string;
  body: string;
  dateSent: Date;
  contact: Contact;
  imageUrls: string[] | null; // Optional prop for the image URL
  type: "email" | "sms"
}

const MessageBubble = (props: PropType) => {
  const { status, body, dateSent, contact, imageUrls, type } = props;

  return (
    <>
      {status === "received" ? (
        <div className="w-full flex items-end justify-end text-right">
          <div className="flex items-start gap-2.5 shadow-xl">
            <div className={`flex flex-col w-full leading-1.5 p-4 rounded-l-xl rounded-br-xl bg-gray-800 ${type === "email" ? "max-w-[40rem] " : "max-w-[20rem] "}`}>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white w-full">
                  {contact.firstName} {contact.lastName}
                </span>
                <span className="text-sm font-normal text-gray-400 text-nowrap">
                  {formatTime(dateSent)}
                </span>
              </div>
              <div className="text-sm font-normal py-2.5 text-white" dangerouslySetInnerHTML={{ __html: body }} />
              {imageUrls && (
                <>
                  {
                    imageUrls.map((imageUrl) => <img
                      src={imageUrl}
                      key={imageUrl}
                      alt="Attached"
                      className="mt-2 rounded-lg max-w-full max-h-40 object-cover"
                    />)
                  }
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2.5">
          <div className={`flex flex-col w-full leading-1.5 p-4 rounded-e-xl rounded-es-xl bg-gray-800 shadow-xl ${type === "email" ? "max-w-[40rem] " : "max-w-[20rem] "}`}>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white">Patterson Park Music</span>
              <span className="text-sm font-normal text-gray-400 text-nowrap">
                {formatTime(dateSent)}
              </span>
            </div>
            <div className="text-sm font-normal py-2.5 text-white" dangerouslySetInnerHTML={{ __html: body }} />
            {imageUrls && (
              <>
                {
                  imageUrls.map((imageUrl) => <img
                    src={imageUrl}
                    key={imageUrl}
                    alt="Attached"
                    className="mt-2 rounded-lg max-w-full max-h-40 object-cover"
                  />)
                }
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;