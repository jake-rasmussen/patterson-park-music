import { Divider } from "@heroui/react";
import { IconMessage, IconClock, IconUserEdit, IconSchool, IconMusic, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";

const Navbar = () => {
  return (
    <main className="overflow-y-scroll flex flex-col items-center h-screen">
      <div className="grow">
        <IconMusic className="text-white w-12 h-12 w-full" />
        <h1 className="text-white text-md font-black">Patterson Park Music</h1>
      </div>

      <div className="flex flex-col gap-8 items-center p-4">
        <Link href="/message" className="w-full">

        </Link>
        <Link href="/schedule" className="w-full">
          <div className="text-white w-full flex justify-start flex-row items-center gap-4 mx-2">
            <IconClock className="text-white h-8 w-8" /> Schedule Message
          </div>
        </Link>
        <Link href={"/bulk"} className="w-full">
          <div className="text-white w-full flex justify-start flex-row items-center gap-4 mx-2">
            <IconUsersGroup className="text-white h-8 w-8" /> Bulk Message
          </div>
        </Link>
        <Link href="/users" className="w-full">
          <div className="text-white w-full flex justify-start flex-row items-center gap-4 mx-2">
            <IconUserEdit className="text-white h-8 w-8" /> Manage Users
          </div>
        </Link>
        <Link href="/section" className="w-full">
          <div className="text-white w-full flex justify-start flex-row items-center gap-4 mx-2">
            <IconMusic className="text-white h-8 w-8" /> Manage Sections
          </div>
        </Link>
        <Link href="/students" className="w-full">
          <div className="text-white w-full flex justify-start flex-row items-center gap-4 mx-2">
            <IconSchool className="text-white h-8 w-8" />Student Roster
          </div>
        </Link>
      </div >

      <div className="grow flex items-end">
        {/* <IconLogout className="text-white h-8 w-8" /> */}
      </div>
    </main>
  );
}

export default Navbar;