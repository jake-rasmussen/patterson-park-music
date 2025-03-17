import { Button, Divider } from "@heroui/react";
import { IconMessage, IconClock, IconUserEdit, IconSchool, IconMusic, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";

const Navbar = () => {
  return (
    <main className="overflow-y-scroll flex flex-col gap-10 items-center h-screen max-w-32 md:max-w-xs text-white">
      <Link className="w-fit mx-4 md:mx-16" href="/">
        <img src="./PPAM.png" className="h-auto w-full" />
      </Link>

      <div className="flex flex-col gap-8">
        <div className="w-full flex flex-col gap-1">
          <h1 className="font-black uppercase text-xl">
            <p className="hidden md:flex">Messages</p>
            <p className="md:hidden flex">...</p>
          </h1>
          <Divider className="bg-secondary" />
          <Link href="/message" className="w-full">
            <Button
              startContent={<IconMessage className="text-white" />}
              className="w-full text-white flex justify-start text-lg hidden md:flex"
              variant="light"
              size="lg"
            >
              Message
            </Button>

            <Button
              startContent={<IconMessage className="text-white" />}
              className="w-full text-white flex md:hidden"
              variant="light"
              size="lg"
              isIconOnly
            />
          </Link>
          <Link href="/bulk" className="w-full">
            <Button
              startContent={<IconUsersGroup className="text-white" />}
              className="w-full  text-white flex justify-start text-lg hidden md:flex"
              variant="light"
              size="lg"
            >
              Bulk Message
            </Button>

            <Button
              startContent={<IconUsersGroup className="text-white" />}
              className="w-full text-white flex md:hidden"
              variant="light"
              size="lg"
              isIconOnly
            />
          </Link>
          <Link href="/schedule" className="w-full">
            <Button
              startContent={<IconClock className="text-white" />}
              className="w-full  text-white flex justify-start text-lg hidden md:flex"
              variant="light"
              size="lg"
            >
              Schedule Message
            </Button>

            <Button
              startContent={<IconClock className="text-white" />}
              className="w-full text-white flex md:hidden"
              variant="light"
              size="lg"
              isIconOnly
            />
          </Link>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h1 className="font-black uppercase text-xl">
            <p className="hidden md:flex">Users</p>
            <p className="md:hidden flex">...</p>
          </h1>
          <Divider className="bg-secondary" />
          <Link href="/users" className="w-full">
            <Button
              startContent={<IconUserEdit className="text-white" />}
              className="w-full  text-white flex justify-start text-lg hidden md:flex"
              variant="light"
              size="lg"
            >
              Manage Users
            </Button>

            <Button
              startContent={<IconUserEdit className="text-white" />}
              className="w-full text-white flex md:hidden"
              variant="light"
              size="lg"
              isIconOnly
            />
          </Link>
          <Link href="/students" className="w-full">
            <Button
              startContent={<IconSchool className="text-white" />}
              className="w-full  text-white flex justify-start text-lg hidden md:flex"
              variant="light"
              size="lg"
            >
              Student Roster
            </Button>

            <Button
              startContent={<IconSchool className="text-white" />}
              className="w-full text-white flex md:hidden"
              variant="light"
              size="lg"
              isIconOnly
            />
          </Link>
        </div>

        <div className="w-full flex flex-col gap-1">
          <h1 className="font-black uppercase">
            <p className="hidden md:flex">Other</p>
            <p className="md:hidden flex">...</p>
          </h1>
          <Divider className="bg-secondary" />
          <Link href="/section" className="w-full">
            <Button
              startContent={<IconMusic className="text-white" />}
              className="w-full  text-white flex justify-start text-lg hidden md:flex"
              variant="light"
              size="lg"
            >
              Manage Sections
            </Button>

            <Button
              startContent={<IconMusic className="text-white" />}
              className="w-full text-white flex md:hidden"
              variant="light"
              size="lg"
              isIconOnly
            />
          </Link>
        </div>
      </div >
    </main>
  );
}

export default Navbar;