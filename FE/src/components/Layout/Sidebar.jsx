import React, { createContext, useContext, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronLast,
  ChevronFirst,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

const SidebarContext = createContext();
const useSidebar = () => useContext(SidebarContext);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="min-h-screen">
      <nav className="h-full flex flex-col bg-gray-900 text-white shadow-sm relative">
        <div className="p-4 pb-2 flex justify-between items-center">
          <h2
            className={`uppercase tracking-wider text-lg font-semibold overflow-hidden transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
          >
            Menu
          </h2>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 my-10 space-y-6 ">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={<item.icon className="w-5 h-5" />}
                text={item.label}
                active={isActive(item.path)}
                onClick={() => navigate(item.path)}
              />
            ))}
          </ul>
        </SidebarContext.Provider>

        <div className="border-t border-gray-700 flex p-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}
          >
            <div className="leading-4">
              <p className="text-sm font-medium text-white">Dealer Staff</p>
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, text, active, onClick, alert }) {
  const { expanded } = useSidebar();

  return (
    <li
      onClick={onClick}
      className={`
        relative flex items-center py-2 px-3 
        font-medium rounded-md cursor-pointer transition-colors group
        ${
          active
            ? "bg-gradient-to-tr from-blue-500/20 to-blue-500/10 text-white"
            : "hover:bg-gray-800 text-gray-300"
        }
      `}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}
      {!expanded && (
        <div
          className="
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          "
        >
          {text}
        </div>
      )}
    </li>
  );
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  { id: "inventory", label: "Inventory", icon: Package, path: "/inventory" },
  { id: "customers", label: "Customers", icon: Users, path: "/customers" },
  { id: "orders", label: "Orders", icon: ShoppingCart, path: "/orders" },
  { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];
