import { CreditCard, History, LayoutDashboard, SettingsIcon, TrendingUp } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-plays", label: "My Plays", icon: TrendingUp },
    { href: "/history", label: "History", icon: History },
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;
