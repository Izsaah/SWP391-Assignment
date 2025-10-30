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
  ChevronDown,
  ChevronRight,
  Car,
  FileText,
  ScrollText,
  CreditCard,
  DollarSign,
  List,
  Calendar,
  MessageSquare,
  UserCog,
  TrendingUp,
  CheckCircle,
  Building2,
  PieChart,
  Boxes,
  TruckIcon,
  UserCheck,
  XCircle,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

const SidebarContext = createContext();
const useSidebar = () => useContext(SidebarContext);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (dropdownId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };

  return (
    <aside className="min-h-screen">
      <nav className="h-full flex flex-col bg-gray-800 text-white shadow-sm relative">
        <div className="p-3 pb-2 flex justify-between items-center border-b border-gray-700">
          <div
            className={`flex items-center space-x-2 overflow-hidden transition-all ${
              expanded ? "w-48" : "w-0"
            }`}
          >
            <span className="text-xl">🚘</span>
            <h2 className="text-sm font-bold text-white whitespace-nowrap">
              EVDMS - Manager
            </h2>
          </div>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            {expanded ? <ChevronFirst className="w-4 h-4" /> : <ChevronLast className="w-4 h-4" />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded, openDropdowns, toggleDropdown }}>
          <ul className="flex-1 px-2 my-4 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={<item.icon className="w-4 h-4" />}
                text={item.label}
                active={isActive(item.path)}
                onClick={() => item.subItems ? toggleDropdown(item.id) : navigate(item.path)}
                subItems={item.subItems}
                dropdownId={item.id}
              />
            ))}
          </ul>
        </SidebarContext.Provider>

        <div className="border-t border-gray-700 flex p-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <UserCog className="w-4 h-4 text-white" />
          </div>
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? "w-40 ml-2" : "w-0"
            }`}
          >
            <div className="leading-4">
              <p className="text-sm font-medium text-white">Manager</p>
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, text, active, onClick, alert, subItems, dropdownId }) {
  const { expanded, openDropdowns } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const isDropdownOpen = openDropdowns[dropdownId];
  const hasSubItems = subItems && subItems.length > 0;

  const handleSubItemClick = (subItem) => {
    navigate(subItem.path);
  };

  return (
    <li className="relative">
      <div
        onClick={onClick}
        className={`
          relative flex items-center py-2 px-3 
          text-sm font-medium rounded-md cursor-pointer transition-colors group
          ${
            active
              ? "bg-indigo-600 text-white shadow-sm"
              : "hover:bg-gray-800 text-gray-300"
          }
        `}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-40 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>
        
        {/* Dropdown arrow */}
        {hasSubItems && expanded && (
          <div className="ml-auto">
            {isDropdownOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        )}

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
      </div>

      {/* Dropdown sub-items */}
      {hasSubItems && expanded && isDropdownOpen && (
        <ul className="ml-6 mt-1 space-y-1">
          {subItems.map((subItem) => (
            <li
              key={subItem.id}
              onClick={() => handleSubItemClick(subItem)}
              className={`
                flex items-center py-1.5 px-3 
                text-sm font-medium rounded-md cursor-pointer transition-colors group
                ${
                  location.pathname === subItem.path
                    ? "bg-indigo-500/20 text-indigo-200"
                    : "hover:bg-gray-800 text-gray-400"
                }
              `}
            >
              <subItem.icon className="w-3 h-3" />
              <span className="ml-2 text-xs">{subItem.label}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dealer Overview",
    icon: LayoutDashboard,
    path: "/manager/dashboard",
  },
  { 
    id: "inventory", 
    label: "Inventory", 
    icon: Package, 
    path: "/manager/inventory",
    subItems: [
      {
        id: "vehicle-list",
        label: "Vehicle List",
        icon: Car,
        path: "/manager/inventory/vehicles"
      },
      {
        id: "stock-overview",
        label: "Stock Overview",
        icon: Boxes,
        path: "/manager/inventory/stock"
      },
      {
        id: "manufacturer-requests",
        label: "Request from Manufacturer",
        icon: TruckIcon,
        path: "/manager/inventory/manufacturer-requests"
      }
    ]
  },
  { 
    id: "sales", 
    label: "Sales", 
    icon: DollarSign, 
    path: "/manager/sales",
    subItems: [
      {
        id: "quotations",
        label: "Quotations",
        icon: FileText,
        path: "/manager/sales/quotations"
      },
      {
        id: "contracts",
        label: "Contracts",
        icon: ScrollText,
        path: "/manager/sales/contracts"
      },
      {
        id: "payment-delivery",
        label: "Payment & Delivery",
        icon: CreditCard,
        path: "/manager/sales/payment-delivery"
      }
    ]
  },
  { 
    id: "customers", 
    label: "Customers", 
    icon: Users, 
    path: "/manager/customers",
    subItems: [
      {
        id: "customer-list",
        label: "Customer List",
        icon: Users,
        path: "/manager/customers/list"
      },
      {
        id: "test-drive-schedule",
        label: "Test Drive Schedule",
        icon: Calendar,
        path: "/manager/customers/test-drive"
      },
      {
        id: "feedback-complaints",
        label: "Feedback & Complaints",
        icon: MessageSquare,
        path: "/manager/customers/feedback"
      }
    ]
  },
  { 
    id: "reports", 
    label: "Reports", 
    icon: BarChart3, 
    path: "/manager/reports",
    subItems: [
      {
        id: "sales-performance",
        label: "Sales Performance",
        icon: TrendingUp,
        path: "/manager/reports/sales-performance"
      },
      {
        id: "inventory-report",
        label: "Inventory Report",
        icon: PieChart,
        path: "/manager/reports/inventory"
      },
      {
        id: "financial-report",
        label: "Financial Report",
        icon: DollarSign,
        path: "/manager/reports/financial"
      }
    ]
  },
  { 
    id: "approvals", 
    label: "Approvals", 
    icon: ClipboardCheck, 
    path: "/manager/approvals",
    subItems: [
      {
        id: "quotation-approvals",
        label: "Quotation Approvals",
        icon: CheckCircle,
        path: "/manager/approvals/quotations"
      },
      {
        id: "vehicle-requests",
        label: "Vehicle Requests",
        icon: TruckIcon,
        path: "/manager/approvals/vehicle-requests"
      },
      {
        id: "refund-cancel",
        label: "Refund / Cancel Requests",
        icon: XCircle,
        path: "/manager/approvals/refund-cancel"
      }
    ]
  },
  { 
    id: "staff-management", 
    label: "Staff Management", 
    icon: UserCog, 
    path: "/manager/staff",
    subItems: [
      {
        id: "staff-list",
        label: "Staff List",
        icon: Users,
        path: "/manager/staff/list"
      },
      {
        id: "performance-tracking",
        label: "Performance Tracking",
        icon: UserCheck,
        path: "/manager/staff/performance"
      }
    ]
  },
  { 
    id: "settings", 
    label: "Settings", 
    icon: Settings, 
    path: "/manager/settings",
    subItems: [
      {
        id: "dealer-profile",
        label: "Dealer Profile",
        icon: Building2,
        path: "/manager/settings/dealer-profile"
      },
      {
        id: "account-settings",
        label: "Account Settings",
        icon: UserCog,
        path: "/manager/settings/account"
      }
    ]
  },
];

