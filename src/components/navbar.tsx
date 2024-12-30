import { Button } from "@nextui-org/button";
import { Icon3dCubeSphere, IconLogout, IconMessage, IconClock, IconUsersGroup, IconUserEdit, IconSchool } from "@tabler/icons-react";
import Link from "next/link";


const Navbar = () => {
  return (<>
    <div className="grow">
      <Icon3dCubeSphere className="text-white h-20 w-12 border-b border-white" />
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
        <Button className="text-white w-full flex justify-start" size="lg" variant="light" startContent={<IconSchool className="text-white h-12 w-12" />}>
          Manage Sections
        </Button>
      </Link>
    </div >

    <div className="grow flex items-end">
      <IconLogout className="text-white h-12 w-12" />
    </div>
  </>);
}

export default Navbar;