import { Icon3dCubeSphere, IconHome, IconCalendar, IconPencil, IconBolt, IconLogout, IconUser, IconMessage, IconUserPlus, IconClock, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";


const Navbar = () => {
  return (<>
    <div className="grow">
      <Icon3dCubeSphere className="text-white h-20 w-12 border-b border-white" />
    </div>

    <Link href={"/message"}>
      <IconMessage className="text-white h-12 w-12" />
    </Link>
    <Link href={"/contact"}>
      <IconUserPlus className="text-white h-12 w-12" />
    </Link>
    <Link href={"/schedule"}>
      <IconClock className="text-white h-12 w-12" />
    </Link>
    <Link href={"/bulk"}>
      <IconUsersGroup className="text-white h-12 w-12" />
    </Link>

    <div className="grow flex items-end">
      <IconLogout className="text-white h-12 w-12" />
    </div>
  </>);
}

export default Navbar;