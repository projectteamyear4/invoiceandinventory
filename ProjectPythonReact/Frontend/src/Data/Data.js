// Sidebar imports
import {
  UilChart, UilClipboardAlt, UilEstate,
  UilPackage,
  UilUsersAlt
} from "@iconscout/react-unicons";



// Original Sidebar Data with Khmer Translations
export const SidebarData = [
  { icon: UilEstate, heading: "ផ្ទាំងគ្រប់គ្រង", path: "/dashboard" }, // Dashboard
  { icon: UilClipboardAlt, heading: "អ្នកផ្គត់ផ្គង់", path: "/suppliers" }, // Orders
  { icon: UilUsersAlt, heading: "អតិថិជន", path: "/customers" }, // Customers
  { icon: UilPackage, heading: "ផលិតផល", path: "/products" }, // Products
  { icon: UilChart, heading: "បញ្ជីប្រភេទ", path: "/purchases" }, // CategoryList
  { icon: UilEstate, heading: "ឃ្លាំង", path: "/warehouses" }, // ProductList
  { icon: UilChart, heading: "វិក្កយបត្រ", path: "/invoice" }, // Invoice
  { icon: UilClipboardAlt, heading: "បញ្ជីវិក្កយបត្រ", path: "/invoicelist" }, // InvoiceList
];

export const cardsData = [
  {
    title: "លក់", // Sales
    color: { backGround: "#e3f2fd", border: "1px solid #1976d2", boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)" },
    barValue: 75,
    value: "២៥,៩៧០", // 25,970 in Khmer numerals
    png: "UilShoppingCart",
    series: [{ name: "លក់", data: [30, 45, 60, 80, 100] }],
  },
  // {
  //   title: "ចំណាយ", // Cost
  //   color: { backGround: "#fce4ec", border: "1px solid #2F95DAFF", boxShadow: "0 4px 10px rgba(216, 27, 96, 0.3)" },
  //   barValue: 60,
  //   value: "១៤,២៧៦", // 14,276 in Khmer numerals
  //   png: "UilMoneyWithdrawal",
  //   series: [{ name: "ចំណាយ", data: [20, 50, 70, 30, 40] }],
  // },
  {
    title: "ប្រាក់ចំណូល", // Revenue
    color: { backGround: "#e8f5e9", border: "1px solid #2e7d32", boxShadow: "0 4px 10px rgba(46, 125, 50, 0.3)" },
    barValue: 85,
    value: "៤,២៧៦", // 4,276 in Khmer numerals
    png: "UilClipboardAlt",
    series: [{ name: "ប្រាក់ចំណូល", data: [10, 20, 30, 40, 50] }],
  },
];

