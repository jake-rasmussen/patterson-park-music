import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/react";
import { IconLogout, IconMessage, IconClock, IconUserEdit, IconSchool, IconMusic } from "@tabler/icons-react";
import Link from "next/link";

const Navbar = () => {
  return (<main className="overflow-y-scroll flex flex-col items-center h-screen">
    <div className="grow flex flex-col gap-4 max-w-md">
      <IconMusic className="text-white h-20 w-full" />
      <Divider className="bg-white" />
      <h1 className="text-white text-xl uppercase font-black text-center px-4">Patterson <br />Park Music</h1>
    </div>

    <div className="flex flex-col gap-8 items-center p-4">
      <Link href={"/message"} className="w-full">
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconMessage className="text-white h-12 w-12" />}>
          Message
        </Button>
      </Link>
      <Link href={"/schedule"} className="w-full">
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconClock className="text-white h-12 w-12" />}>
          Schedule Message
        </Button>
      </Link>
      {/* <Link href={"/bulk"} className="w-full">
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconUsersGroup className="text-white h-12 w-12" />}>
          Bulk Message
        </Button>
      </Link> */}
      <Link href={"/users"} className="w-full">
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconUserEdit className="text-white h-12 w-12" />}>
          Manage Users
        </Button>
      </Link>
      <Link href={"/section"} className="w-full">
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconMusic className="text-white h-12 w-12" />}>
          Manage Sections
        </Button>
      </Link>
      <Link href={"/students"} className="w-full">
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconSchool className="text-white h-12 w-12" />}>
          Student Roster
        </Button>
      </Link>
    </div >

    <div className="grow flex items-end">
      {/* <IconLogout className="text-white h-12 w-12" /> */}
    </div>
  </main>);
}

export default Navbar;