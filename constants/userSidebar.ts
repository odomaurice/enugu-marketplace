import { IconType } from "react-icons";
import { GrMapLocation, GrTransaction } from "react-icons/gr";
import { RiHome5Line } from "react-icons/ri";
import { FaOpencart } from "react-icons/fa";
import { TbReorder } from "react-icons/tb";
import { MdOutlineSettings } from "react-icons/md";

export interface UserSideBarType {
    path: string;
    icon?: IconType;
    name: string;
    dynamicPath?: string; // Add this new optional field
}

export const UserSideBar: UserSideBarType[] = [
    { path: "", name: "Dashboard", icon: RiHome5Line },
    { 
      path: "wishlists", 
      name: "Wishlist", 
      icon: FaOpencart
    },
    { path: "orders", name: "Orders", icon: TbReorder },
     { path: "addresses", name: "Address", icon: GrMapLocation },
     { path: "user-settings", name: "Settings", icon: MdOutlineSettings },
];