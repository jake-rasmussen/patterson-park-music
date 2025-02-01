import { Divider } from "@nextui-org/react";
import { IconMessage, IconClock, IconUserEdit, IconSchool, IconMusic } from "@tabler/icons-react";
import Link from "next/link";

const Navbar = () => {
  return (<main className="overflow-y-scroll flex flex-col items-center h-screen">
    <div className="grow flex flex-col gap-4 max-w-md">
      <IconMusic className="text-white h-20 w-full" />
      <Divider className="bg-white" />
      <h1 className="text-white text-xl uppercase font-black text-center px-4">Patterson <br />Park Music</h1>
    </div>

    <div className="flex flex-col gap-8 items-center p-4">
      <Link href="/message" className="w-full">
        <div className="text-white w-full flex justify-start flex-row items-center gap-2 mx-2">
          <IconMessage className="text-white h-12 w-12" /> Message
        </div>
      </Link>
      <Link href="/schedule" className="w-full">
        <div className="text-white w-full flex justify-start flex-row items-center gap-2 mx-2">
          <IconClock className="text-white h-12 w-12" /> Schedule Message
        </div>
      </Link>
      {/* <Link href={"/bulk"} className="w-full">
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconUsersGroup className="text-white h-12 w-12" />}>
          Bulk Message
        </Button>
      </Link> */}
      <Link href="/users" className="w-full">
        <div className="text-white w-full flex justify-start flex-row items-center gap-2 mx-2">
          <IconUserEdit className="text-white h-12 w-12" /> Manage Users
        </div>
      </Link>
      <Link href="/section" className="w-full">
        <div className="text-white w-full flex justify-start flex-row items-center gap-2 mx-2">
          <IconMusic className="text-white h-12 w-12" /> Manage Sections
        </div>
      </Link>
      <Link href="/students" className="w-full">
        <div className="text-white w-full flex justify-start flex-row items-center gap-2 mx-2">
          <IconSchool className="text-white h-12 w-12" />Student Roster
        </div>
      </Link>
    </div >

    <div className="grow flex items-end">
      {/* <IconLogout className="text-white h-12 w-12" /> */}
    </div>
  </main>);
}

export default Navbar;