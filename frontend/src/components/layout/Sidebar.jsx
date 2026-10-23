import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    ArrowLeftRight,
    CreditCard,
    BarChart3,
    User,
    ChevronLeft,
    Plus,
    LogOut,
    Laptop,
    MonitorSmartphone,
} from "lucide-react";


const mainNavigation = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Statistics", path: "/statistics", icon: BarChart3 },
    { name: "Profile", path: "/profile", icon: User },
];

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a227]";

// Label that smoothly collapses to nothing when the sidebar is narrow
const labelClass = (collapsed) =>
    "overflow-hidden whitespace-nowrap transition-all duration-300 " +
    (collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100");

// Small tooltip shown only while collapsed
const Tooltip = ({ show, children }) =>
    show ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#14201c] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
            {children}
        </span>
    ) : null;

const Sidebar = ({
    onLogoutThisDevice,
    onLogoutAllDevices = () => {},
}) => {
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("sidebar-collapsed") === "true";
        } catch {
            return false;
        }
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const footerRef = useRef(null);
    const logoutBtnRef = useRef(null);
    const navigate = useNavigate()
    useEffect(() => {
        try {
            localStorage.setItem("sidebar-collapsed", String(collapsed));
        } catch {
            /* storage unavailable, ignore */
        }
    }, [collapsed]);

    // Close the logout menu on outside click or Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onMouseDown = (e) => {
            if (footerRef.current && !footerRef.current.contains(e.target))
                setMenuOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                logoutBtnRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    const choose = (handler) => () => {
        setMenuOpen(false);
        handler();
    };

    return (
        <aside
            className={
                "sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#cfd9d3] bg-white font-['Figtree',system-ui,sans-serif] transition-[width] duration-300 ease-out " +
                (collapsed ? "w-20" : "w-64")
            }
        >
            <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                className={
                    "absolute -right-3 top-8 z-30 grid h-6 w-6 cursor-pointer place-items-center rounded-full border border-[#cfd9d3] bg-white text-[#0f3d33] shadow-sm transition-colors hover:bg-[#0f3d33] hover:text-white " +
                    focusRing
                }
            >
                <ChevronLeft
                    size={14}
                    className={
                        "transition-transform duration-300 " +
                        (collapsed ? "rotate-180" : "")
                    }
                />
            </button>

            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-6">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0f3d33] font-['Unbounded',sans-serif] text-lg font-bold text-[#c9a227] shadow-[0_6px_16px_-6px_rgba(15,61,51,0.8)]">
                    E
                </div>
                <h1
                    className={
                        "font-['Unbounded',sans-serif] text-xl font-bold tracking-tight text-[#14201c] " +
                        labelClass(collapsed)
                    }
                >
                    Expensio
                </h1>
            </div>

            {/* Primary action */}
            <div className="px-3 pb-4">
                <button
                    type="button"
                    onClick={() => navigate("/transactions")}
                    className={
                        "group relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f3d33] py-3 font-semibold text-white shadow-[0_8px_18px_-8px_rgba(15,61,51,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b2e26] active:translate-y-0 active:scale-95 " +
                        focusRing
                    }
                >
                    <Plus
                        size={18}
                        className="shrink-0 transition-transform duration-200 group-hover:rotate-90"
                    />
                    <span className={labelClass(collapsed)}>
                        Add transaction
                    </span>
                    <Tooltip show={collapsed}>Add transaction</Tooltip>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3" aria-label="Main">
                <p
                    className={
                        "mb-2 px-4 text-[11px] font-semibold uppercase tracking-widest text-[#6f7f78] " +
                        labelClass(collapsed)
                    }
                >
                    Menu
                </p>

                <ul className="space-y-1">
                    {mainNavigation.map(({ name, path, icon: Icon }) => (
                        <li key={path}>
                            <NavLink
                                to={path}
                                aria-label={collapsed ? name : undefined}
                                className={({ isActive }) =>
                                    "group relative flex items-center rounded-xl py-3 transition-all duration-200 " +
                                    focusRing +
                                    " " +
                                    (collapsed
                                        ? "justify-center px-0 "
                                        : "gap-3 px-4 ") +
                                    (isActive
                                        ? "bg-[#c9a227] text-[#0f3d33] shadow-[0_10px_22px_-10px_rgba(201,162,39,0.9)]"
                                        : "text-[#5b6b65] hover:bg-[#eaf2ee] hover:text-[#0f3d33]" +
                                          (collapsed
                                              ? ""
                                              : " hover:translate-x-1"))
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Green marker on the active item */}
                                        <span
                                            aria-hidden="true"
                                            className={
                                                "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#0f3d33] transition-all duration-300 " +
                                                (isActive
                                                    ? "opacity-100"
                                                    : "h-0 opacity-0")
                                            }
                                        />
                                        <Icon
                                            size={20}
                                            className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                                        />
                                        <span
                                            className={
                                                "font-medium " +
                                                labelClass(collapsed)
                                            }
                                        >
                                            {name}
                                        </span>
                                        <Tooltip show={collapsed}>
                                            {name}
                                        </Tooltip>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div
                ref={footerRef}
                className="relative border-t border-[#cfd9d3] p-3"
            >
                {menuOpen && (
                    <div
                        role="menu"
                        aria-label="Log out options"
                        className={
                            "z-30 rounded-xl border border-[#cfd9d3] bg-white p-1.5 shadow-[0_16px_32px_-12px_rgba(15,61,51,0.35)] " +
                            (collapsed
                                ? "absolute bottom-3 left-full ml-3 w-64"
                                : "absolute bottom-full left-3 right-3 mb-2")
                        }
                    >
                        <button
                            type="button"
                            role="menuitem"
                            onClick={choose(onLogoutThisDevice)}
                            className={
                                "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#eaf2ee] " +
                                focusRing
                            }
                        >
                            <Laptop
                                size={18}
                                className="shrink-0 text-[#0f3d33]"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-[#14201c]">
                                    Log out of this device
                                </span>
                                <span className="block text-xs text-[#5b6b65]">
                                    Ends only this session
                                </span>
                            </span>
                        </button>

                        <button
                            type="button"
                            role="menuitem"
                            onClick={choose(onLogoutAllDevices)}
                            className={
                                "mt-1 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#fef3f2] " +
                                focusRing
                            }
                        >
                            <MonitorSmartphone
                                size={18}
                                className="shrink-0 text-[#b42318]"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-[#b42318]">
                                    Log out of all devices
                                </span>
                                <span className="block text-xs text-[#5b6b65]">
                                    Signs you out everywhere
                                </span>
                            </span>
                        </button>
                    </div>
                )}

                <button
                    ref={logoutBtnRef}
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    className={
                        "group relative flex w-full cursor-pointer items-center rounded-xl py-3 transition-colors hover:bg-[#faf3d6] hover:text-[#14201c] " +
                        (menuOpen
                            ? "bg-[#faf3d6] text-[#14201c] "
                            : "text-[#5b6b65] ") +
                        (collapsed ? "justify-center px-0 " : "gap-3 px-4 ") +
                        focusRing
                    }
                >
                    <LogOut
                        size={20}
                        className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                    />
                    <span className={"font-medium " + labelClass(collapsed)}>
                        Log out
                    </span>
                    <Tooltip show={collapsed && !menuOpen}>Log out</Tooltip>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
