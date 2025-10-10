import { IconType } from "react-icons";
import { RiHome5Line } from "react-icons/ri";
import { LuHandshake, LuUsers } from "react-icons/lu";
import { PiWarehouse } from "react-icons/pi";
import { BiCategoryAlt } from "react-icons/bi";
import { MdOutlineInventory2, MdOutlineProductionQuantityLimits, MdSupportAgent } from "react-icons/md";
import { FiShoppingBag } from "react-icons/fi";
import { BsCart4 } from "react-icons/bs";


export interface CashierSideBarType {
    path: string;
    icon?: IconType;
    name: string;
  }


export const CashierSideBar: CashierSideBarType[] = [
    { path: "", name: "Dashboard", icon: RiHome5Line },
    { path: "users", name: "Users", icon: LuUsers },
    { path: "cart", name: "Carts", icon: MdOutlineProductionQuantityLimits },
    { path: "orders", name: "Orders", icon: FiShoppingBag  },
    // { path: "inventory", name: "Inventory", icon: MdOutlineInventory2 },
    // { path: "warehouse", name: "Warehouse", icon: PiWarehouse },
    // { path: "categories", name: "Categories", icon: BiCategoryAlt},
   
   
  ];