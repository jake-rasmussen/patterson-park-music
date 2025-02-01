import { Button } from "@nextui-org/button";
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
        <button className="text-white w-full flex flex-row items-center gap-2 justify-start">
          <IconMessage className="text-white h-12 w-12" /> Message
        </button>
      </Link>
      <Link href="/schedule" className="w-full">
        <button className="text-white w-full flex flex-row items-center gap-2 justify-start">
          <IconClock className="text-white h-12 w-12" /> Schedule Message
        </button>
      </Link>
      {/* <Link href={"/bulk"} className="w-full">
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconUsersGroup className="text-white h-12 w-12" />}>
          Bulk Message
        </Button>
      </Link> */}
      <Link href="/users" className="w-full">
        <button className="text-white w-full flex flex-row items-center gap-2 justify-start">
          <IconUserEdit className="text-white h-12 w-12" /> Manage Users
        </button>
      </Link>
      <Link href="/section" className="w-full">
        <button className="text-white w-full flex flex-row items-center gap-2 justify-start">
          <IconMusic className="text-white h-12 w-12" /> Manage Sections
        </button>
      </Link>
      <Link href="/students" className="w-full">
        <button className="text-white w-full flex flex-row items-center gap-2 justify-start">
          <IconSchool className="text-white h-12 w-12" /> Student Roster
        </button>
      </Link>
    </div >

    <div className="grow flex items-end">
      {/* <IconLogout className="text-white h-12 w-12" /> */}
    </div>
  </main>);
}

export default Navbar;