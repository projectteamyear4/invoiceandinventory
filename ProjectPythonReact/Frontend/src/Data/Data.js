// Sidebar imports
import {
  UilChart,
  UilChartPie,
  UilClipboardAlt,
  UilEstate,
  UilMoneyWithdrawal,
  UilPackage,
  UilShoppingCart,
  UilUsdSquare,
  UilUsersAlt
} from "@iconscout/react-unicons";

// Recent Card Imports
import img1 from "../imgs/img1.png";
import img2 from "../imgs/img2.png";
import img3 from "../imgs/img3.png";

export const SidebarData = [
  { icon: UilEstate, heading: "Dashboard", path: "/" },
  { icon: UilClipboardAlt, heading: "Orders", path: "/orders" }, // Add path for Orders
  { icon: UilUsersAlt, heading: "customers", path: "/customers" },
  { icon: UilPackage, heading: "Products", path: "/products" },
  { icon: UilChart, heading: "CategoryList", path: "/CategoryList" },
  { icon: UilChart, heading: "productlist", path: "/productlist" },
];

// Analytics Cards Data
export const cardsData = [
  {
    title: "Sales",
    color: {
      backGround: "#ffffff",
      border: "1px solid #110D14FF",
      boxShadow: "0px 3px 5px 0px #6314BDFF",
    },
    barValue: 70,
    value: "25,970",
    png: UilUsdSquare,
    series: [{ name: "Sales", data: [31, 40, 28, 51, 42, 109, 100] }],
  },
  {
    title: "Cost",
    color: {
      backGround: "#ffffff",
      border: "1px solid #4B4848FF",
      boxShadow: "0px 3px 5px 0px #8D4242FF",
    },
    barValue: 80,
    value: "14,270",
    png: UilMoneyWithdrawal,
    series: [{ name: "Cost", data: [10, 100, 50, 70, 80, 30, 40] }],
  },
  {
    title: "Revenue",
    color: {
      backGround: "#ffffff",
      border: "1px solid #FAD0C4",
      boxShadow: "0px 3px 5px 0px #28AF65FF",
    },
    barValue: 60,
    value: "4,270",
    png: UilClipboardAlt,
    series: [{ name: "Revenue", data: [10, 25, 15, 30, 12, 15, 20] }],
  },
  {
    title: "Profit",
    color: {
      backGround: "#ffffff",
      border: "1px solid #6DD5FA",
      boxShadow: "0px 3px 5px 0px #1678A5FF",
    },
    barValue: 45,
    value: "8,420",
    png: UilChartPie,
    series: [{ name: "Profit", data: [15, 30, 22, 38, 25, 50, 35] }],
  },
  {
    title: "Transactions",
    color: {
      backGround: "#ffffff",
      border: "1px solid #84FAB0",
      boxShadow: "0px 3px 5px 0px #EC0303FF",
    },
    barValue: 90,
    value: "1,230",
    png: UilShoppingCart,
    series: [{ name: "Transactions", data: [50, 70, 65, 90, 80, 95, 85] }],
  },
];

// Recent Update Card Data
export const UpdatesData = [
  {
    img: img1,
    name: "Andrew Thomas",
    noti: "has ordered Apple smart watch 2500mh battery.",
    time: "25 seconds ago",
  },
  {
    img: img2,
    name: "James Bond",
    noti: "has received Samsung gadget for charging battery.",
    time: "30 minutes ago",
  },
  {
    img: img3,
    name: "Iron Man",
    noti: "has ordered Apple smart watch, samsung Gear 2500mh battery.",
    time: "2 hours ago",
  },
];

