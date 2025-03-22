// Sidebar imports
import {
  UilChart,
  UilClipboardAlt,
  UilEstate,
  UilMoneyWithdrawal,
  UilPackage,
  UilShoppingCart,
  UilUsersAlt,
} from "@iconscout/react-unicons";

// Recent Card Imports
import img1 from "../imgs/img1.png";
import img2 from "../imgs/img2.png";
import img3 from "../imgs/img3.png";

// Original Sidebar Data with Khmer Translations
export const SidebarData = [
  { icon: UilEstate, heading: "ផ្ទាំងគ្រប់គ្រង", path: "/dashboard" }, // Dashboard
  { icon: UilClipboardAlt, heading: "អ្នកផ្គត់ផ្គង់", path: "/suppliers" }, // Orders
  { icon: UilUsersAlt, heading: "អតិថិជន", path: "/customers" }, // Customers
  { icon: UilPackage, heading: "ផលិតផល", path: "/products" }, // Products
  { icon: UilChart, heading: "បញ្ជីប្រភេទ", path: "/category-list" }, // CategoryList
  { icon: UilClipboardAlt, heading: "បញ្ជី", path: "/warehouses" }, // ProductList
  { icon: UilChart, heading: "វិក្កយបត្រ", path: "/invoice" }, // Invoice
  { icon: UilClipboardAlt, heading: "បញ្ជីវិក្កយបត្រ", path: "/invoicelist" }, // InvoiceList
];

// Simplified and Cool Analytics Cards Data (already in Khmer)
export const cardsData = [
  {
    title: "លក់", // Sales
    color: { backGround: "#e3f2fd", border: "1px solid #1976d2", boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)" },
    barValue: 75,
    value: "២៥,៩៧០", // 25,970 in Khmer numerals
    png: UilShoppingCart,
    series: [{ name: "លក់", data: [30, 45, 60, 80, 100] }],
  },
  {
    title: "ចំណាយ", // Cost
    color: { backGround: "#fce4ec", border: "1px solid #2F95DAFF", boxShadow: "0 4px 10px rgba(216, 27, 96, 0.3)" },
    barValue: 60,
    value: "១៤,២៧៦", // 14,270 in Khmer numerals
    png: UilMoneyWithdrawal,
    series: [{ name: "ចំណាយ", data: [20, 50, 70, 30, 40] }],
  },
  {
    title: "ប្រាក់ចំណូល", // Revenue
    color: { backGround: "#e8f5e9", border: "1px solid #2e7d32", boxShadow: "0 4px 10px rgba(46, 125, 50, 0.3)" },
    barValue: 85,
    value: "៤,២៧៦", // 4,270 in Khmer numerals
    png: UilClipboardAlt,
    series: [{ name: "ប្រាក់ចំណូល", data: [10, 20, 30, 40, 50] }],
  },
];

// Simplified and Cool Recent Update Card Data (already in Khmer)
export const UpdatesData = [
  {
    img: img1,
    name: "សុខ វិបុល", // Sok Vibol
    noti: "បានកម្ម៉ង់នាឡិកាឆ្លាត Apple ។", // Ordered an Apple smartwatch
    time: "១៦ វិនាទីមុន", // 10 seconds ago
  },
  {
    img: img2,
    name: "គឹម សុភា", // Kim Sophea
    noti: "បានទទួលឧបករណ៍ Samsung ។", // Received a Samsung gadget
    time: "១៥ នាទីមុន", // 15 minutes ago
  },
  {
    img: img3,
    name: "ម៉ី សុជាតិ", // Mey Socheat
    noti: "បានកម្ម៉ង់នាឡិកា និងឧបករណ៍ ។", // Ordered a watch and gadget
    time: "១ ម៉ោងមុន", // 1 hour ago
  },
];