import { cn } from "@clmm/utils";
import { enabledModules } from "@clmm/config/app-modules";
import { ArrowUpDown, ContrastIcon, Droplets, LucideLineChart, Vote } from "lucide-react";
import { matchPath, NavLink, useLocation } from "react-router-dom";

const PATHS = {
    SWAP: "/clmm/swap",
    LIMIT_ORDERS: "limit-order",
    POOLS: "/clmm/pools",
    POOL: "/clmm/pool/*",
    ANALYTICS: "/analytics/*",
    VE_TOKEN: "/vetoken/*",
    VOTE: "/vote/*",
};

const menuItems = [
    {
        title: "Trade",
        link: "/clmm/swap",
        active: [PATHS.SWAP, PATHS.LIMIT_ORDERS],
        icon: <ArrowUpDown size={20} />,
    },
    {
        title: "Pools",
        link: "/clmm/pools",
        active: [PATHS.POOLS, PATHS.POOL],
        icon: <Droplets size={20} />,
    },
    ...(enabledModules.Ve33Module
        ? [
              {
                  title: "veTOKEN",
                  link: "/vetoken",
                  active: [PATHS.VE_TOKEN],
                  icon: <ContrastIcon size={20} />,
              },
              {
                  title: "Vote",
                  link: "/vote",
                  active: [PATHS.VOTE],
                  icon: <Vote size={20} />,
              },
          ]
        : []),
    enabledModules.AnalyticsModule && {
        title: "Analytics",
        link: "/analytics",
        active: [PATHS.ANALYTICS],
        icon: <LucideLineChart size={20} />,
    },
].filter(Boolean) as { title: string; link: string; active: string[]; icon?: React.ReactNode }[];

export function NavButtons() {
    const { pathname } = useLocation();

    const setNavlinkClasses = (paths: string[]) =>
        paths.some((path) => matchPath(path, pathname))
            ? "text-primary-200"
            : "text-text-100 hover:text-primary-200";

    return (
        <>
            {menuItems.map((item) => (
                <NavLink
                    key={`nav-item-${item.link}`}
                    to={{ pathname: item.link }}
                    className={cn(
                        "flex items-center justify-center gap-1.5 cursor-pointer no-underline py-2 px-6 rounded-lg font-medium text-base transition-colors",
                        setNavlinkClasses(item.active)
                    )}
                    style={{ fontFamily: "'Inter', sans-serif", lineHeight: '24px' }}
                >
                    <div className="text-lg md:hidden">{item.icon}</div>
                    <span className="max-md:text-sm">{item.title}</span>
                </NavLink>
            ))}
        </>
    );
}

export function Navigation() {
    return (
        <ul
            className="flex h-fit gap-1 p-1 whitespace-nowrap items-center max-md:hidden rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
        >
            <NavButtons />
        </ul>
    );
}
export function MobileNavigation() {
    return (
        <nav className="fixed flex gap-2 bottom-4 left-1/2 h-full max-h-[64px] md:hidden -translate-x-1/2 z-50 border border-card-border bg-card backdrop-blur-xl shadow-lg p-2 rounded-xl">
            <NavButtons />
        </nav>
    );
}
