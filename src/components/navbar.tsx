import { Button, Divider } from "@heroui/react";
import { IconMessage, IconClock, IconUserEdit, IconSchool, IconMusic, IconUsersGroup, IconLogout } from "@tabler/icons-react";
import Link from "next/link";

const Navbar = () => {
  return (
    <main className="overflow-y-scroll flex flex-col gap-10 items-center h-screen max-w-xs text-white">
      <Link className="w-fit mx-16" href="/">
        <img src="./PPAM.png" className="h-auto w-full" />
      </Link>

      <div className="flex flex-col gap-8">
        <div className="w-full flex flex-col gap-1">
          <h1 className="font-black uppercase text-xl">Messaging</h1>
          <Divider className="bg-secondary"/>
          <Link href="/message" className="w-full">
            <Button startContent={<IconMessage className="text-white" />} className="w-full text-white flex justify-start text-lg" variant="light" size="lg">
              Message
            </Button>
          </Link>
          <Link href="/bulk" className="w-full">
            <Button startContent={<IconUsersGroup className="text-white" />} className="w-full  text-white flex justify-start text-lg" variant="light" size="lg">
              Bulk Message
            </Button>
          </Link>
          <Link href="/schedule" className="w-full">
            <Button startContent={<IconClock className="text-white" />} className="w-full  text-white flex justify-start text-lg" variant="light" size="lg">
              Schedule Message
            </Button>
          </Link>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h1 className="font-black uppercase text-xl">Users</h1>
          <Divider className="bg-secondary"/>
          <Link href="/users" className="w-full">
            <Button startContent={<IconUserEdit className="text-white" />} className="w-full  text-white flex justify-start text-lg" variant="light" size="lg">
              Manage Users
            </Button>
          </Link>
          <Link href="/students" className="w-full">
            <Button startContent={<IconSchool className="text-white" />} className="w-full  text-white flex justify-start text-lg" variant="light" size="lg">
              Student Roster
            </Button>
          </Link>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h1 className="font-black uppercase">Other</h1>
          <Divider className="bg-secondary"/>
          <Link href="/section" className="w-full">
            <Button startContent={<IconMusic className="text-white" />} className="w-full  text-white flex justify-start text-lg" variant="light" size="lg">
              Manage Sections
            </Button>
          </Link>
        </div>
      </div >
    </main>
  );
}

export default Navbar;