import { Link, useLocation } from "react-router";
import { Trophy, Users, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
    const location = useLocation();

    const links = [
        {
            to: "/",
            icon: LayoutDashboard,
            label: "Dashboard",
            active: location.pathname === "/",
        },
        {
            to: "/tournaments",
            icon: Trophy,
            label: "Tornei",
            active: location.pathname.startsWith("/tournaments"),
        },
        {
            to: "/teams",
            icon: Users,
            label: "Squadre",
            active: location.pathname === "/teams",
        },
    ];

    return (
        <nav
            className="animate-slide-up grid w-full max-w-md grid-cols-3 border border-slate-200 dark:border-[#00C8FF]/20 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-lg overflow-hidden"
            style={{
                animationDelay: "0.1s",
            }}
        >
            {links.map((link) => {
                const Icon = link.icon;
                return (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={cn(
                            "flex items-center justify-center gap-2 px-4 py-2.5 transition-all text-[#0E1E5B] dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10",
                            link.active &&
                                "bg-gradient-to-r from-[#00C8FF] to-[#0099CC] text-white dark:text-white shadow-lg shadow-[#00C8FF]/30 hover:bg-gradient-to-r"
                        )}
                    >
                        <Icon
                            className={cn(
                                "size-4 transition-transform",
                                link.active && "scale-110"
                            )}
                        />
                        <span className="hidden sm:inline">{link.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
