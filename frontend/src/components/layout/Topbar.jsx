// import { useEffect, useRef, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { Bell, Search, User } from "lucide-react";

// const pageTitles = {
//   "/dashboard": "Dashboard",
//   "/transactions": "Transactions",
//   "/payments": "Payments",
//   "/statistics": "Statistics",
//   "/profile": "Profile",
// };

// const focusRing =
//   "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a227]";

//   const Topbar = ({
//   notificationCount = 0,
//   onSearch = () => {},
//   onNotificationsClick = () => {},
//   user,
// }) => {
//   const { pathname } = useLocation();
//   const [query, setQuery] = useState("");
//   const [scrolled, setScrolled] = useState(false);
//   const searchRef = useRef(null);
//   console.log("user in topbar", user.avatar);
//   const title =
//     pageTitles[pathname] ??
//     (pathname.split("/")[1]
//       ? pathname.split("/")[1].charAt(0).toUpperCase() + pathname.split("/")[1].slice(1)
//       : "Dashboard");

//   const today = new Date().toLocaleDateString("en-IN", {
//     weekday: "long",
//     day: "numeric",
//     month: "long",
//   });

//   // Ctrl/Cmd + K focuses the search box
//   useEffect(() => {
//     const onKeyDown = (e) => {
//       if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
//         e.preventDefault();
//         searchRef.current?.focus();
//       }
//     };
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, []);

//   // Add a shadow once the page has been scrolled
//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 4);
//     onScroll();
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSearch(query.trim());
//   };

//   return (
//     <header
//       className={
//         "sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white/80 px-6 py-4 font-['Figtree',system-ui,sans-serif] backdrop-blur transition-shadow duration-300 " +
//         (scrolled
//           ? "border-[#cfd9d3] shadow-[0_8px_24px_-16px_rgba(15,61,51,0.35)]"
//           : "border-transparent")
//       }
//     >
//       {/* Page title + date */}
//       <div className="flex items-center gap-3">
//         <span className="h-9 w-1.5 rounded-full bg-[#0f3d33]" aria-hidden="true" />
//         <div>
//           <h2 className="font-['Unbounded',sans-serif] text-lg font-semibold leading-tight tracking-tight text-[#14201c]">
//             {title}
//           </h2>
//           <p className="text-sm text-[#5b6b65]">{today}</p>
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         {/* Search */}
//         <form
//           onSubmit={handleSubmit}
//           role="search"
//           className="hidden items-center gap-2 rounded-xl border border-[#cfd9d3] bg-[#f3f6f2] px-3 py-2 transition-all duration-300 focus-within:w-72 focus-within:border-[#c9a227] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(201,162,39,0.2)] sm:flex sm:w-52"
//         >
//           <Search size={16} className="shrink-0 text-[#5b6b65]" aria-hidden="true" />
//           <input
//             ref={searchRef}
//             type="search"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search transactions"
//             aria-label="Search transactions"
//             className="w-full bg-transparent text-sm text-[#14201c] outline-none placeholder:text-[#5b6b65]"
//           />
//           <kbd className="hidden shrink-0 rounded-md border border-[#cfd9d3] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#5b6b65] lg:block">
//             Ctrl K
//           </kbd>
//         </form>

//         {/* Notifications */}
//         <button
//           type="button"
//           onClick={onNotificationsClick}
//           aria-label={
//             notificationCount > 0 ? `Notifications, ${notificationCount} unread` : "Notifications"
//           }
//           className={
//             "group relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-[#cfd9d3] bg-white text-[#14201c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f3d33] hover:bg-[#eaf2ee] active:scale-95 " +
//             focusRing
//           }
//         >
//           <Bell
//             size={18}
//             className="origin-top transition-transform duration-200 group-hover:rotate-12"
//           />
//           {notificationCount > 0 && (
//             <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center">
//               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0f3d33] opacity-60" />
//               <span className="relative grid h-5 min-w-5 place-items-center rounded-full bg-[#0f3d33] px-1 text-[10px] font-bold text-white">
//                 {notificationCount > 9 ? "9+" : notificationCount}
//               </span>
//             </span>
//           )}
//         </button>

//         {/* Profile */}
//         <Link
//           to="/profile"
//           aria-label="Open profile"
//           className={
//             "rounded-full ring-2 ring-[#0f3d33] ring-offset-2 transition-all duration-200 hover:scale-105 hover:ring-[#c9a227] " +
//             focusRing
//           }
//         >
//           <img
//             src={`${user?.avatar || "/avatar.jpg"}`}
//             alt="Profile"
//             className="h-10 w-10 cursor-pointer rounded-full object-cover"
//           />
//         </Link>
//       </div>
//     </header>
//   );
// };

// export default Topbar;
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, BellOff, CheckCheck, Search } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/payments": "Payments",
  "/statistics": "Statistics",
  "/profile": "Profile",
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a227]";

// "just now", "5 min ago", "3 hr ago", "2 days ago", then a plain date
const timeAgo = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 45) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fullDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

const Topbar = ({
  user,
  notifications = [], // [{ _id, title, description, createdAt, isRead? }]
  notificationCount, // optional; defaults to the number of unread items
  onNotificationsClick = () => {}, // called each time the panel opens
  onNotificationClick, // optional: (notification) => void
  onMarkAllRead, // optional: shows a "Mark all as read" button
  onSearch = () => {},
}) => {
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const searchRef = useRef(null);
  const bellWrapRef = useRef(null);
  const bellBtnRef = useRef(null);

  const title =
    pageTitles[pathname] ??
    (pathname.split("/")[1]
      ? pathname.split("/")[1].charAt(0).toUpperCase() + pathname.split("/")[1].slice(1)
      : "Dashboard");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Newest first
  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  const unread = notifications.filter((n) => n.isRead === false).length;
  const badgeCount = notificationCount ?? unread;

  // Ctrl/Cmd + K focuses the search box
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Add a shadow once the page has been scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the notifications panel on outside click or Escape
  useEffect(() => {
    if (!panelOpen) return;

    const onMouseDown = (e) => {
      if (bellWrapRef.current && !bellWrapRef.current.contains(e.target)) setPanelOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setPanelOpen(false);
        bellBtnRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panelOpen]);

  const togglePanel = () => {
    setPanelOpen((open) => {
      if (!open) onNotificationsClick();
      return !open;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <header
      className={
        "sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white/80 px-6 py-4 font-['Figtree',system-ui,sans-serif] backdrop-blur transition-shadow duration-300 " +
        (scrolled
          ? "border-[#cfd9d3] shadow-[0_8px_24px_-16px_rgba(15,61,51,0.35)]"
          : "border-transparent")
      }
    >
      <style>{`@keyframes tb-pop{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}`}</style>

      {/* Page title + date */}
      <div className="flex items-center gap-3">
        <span className="h-9 w-1.5 rounded-full bg-[#0f3d33]" aria-hidden="true" />
        <div>
          <h2 className="font-['Unbounded',sans-serif] text-lg font-semibold leading-tight tracking-tight text-[#14201c]">
            {title}
          </h2>
          <p className="text-sm text-[#5b6b65]">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="hidden items-center gap-2 rounded-xl border border-[#cfd9d3] bg-[#f3f6f2] px-3 py-2 transition-all duration-300 focus-within:w-72 focus-within:border-[#c9a227] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(201,162,39,0.2)] sm:flex sm:w-52"
        >
          <Search size={16} className="shrink-0 text-[#5b6b65]" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="w-full bg-transparent text-sm text-[#14201c] outline-none placeholder:text-[#5b6b65]"
          />
          <kbd className="hidden shrink-0 rounded-md border border-[#cfd9d3] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#5b6b65] lg:block">
            Ctrl K
          </kbd>
        </form>

        {/* Notifications */}
        <div ref={bellWrapRef} className="relative">
          <button
            ref={bellBtnRef}
            type="button"
            onClick={togglePanel}
            aria-haspopup="dialog"
            aria-expanded={panelOpen}
            aria-label={
              badgeCount > 0 ? `Notifications, ${badgeCount} unread` : "Notifications"
            }
            className={
              "group relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl border bg-white text-[#14201c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f3d33] hover:bg-[#eaf2ee] active:scale-95 " +
              (panelOpen ? "border-[#0f3d33] bg-[#eaf2ee] " : "border-[#cfd9d3] ") +
              focusRing
            }
          >
            <Bell
              size={18}
              className="origin-top transition-transform duration-200 group-hover:rotate-12"
            />
            {badgeCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0f3d33] opacity-60" />
                <span className="relative grid h-5 min-w-5 place-items-center rounded-full bg-[#0f3d33] px-1 text-[10px] font-bold text-white">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              </span>
            )}
          </button>

          {panelOpen && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 top-full z-30 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] origin-top-right animate-[tb-pop_0.18s_ease-out_both] overflow-hidden rounded-2xl border border-[#cfd9d3] bg-white shadow-[0_24px_48px_-20px_rgba(15,61,51,0.45)] motion-reduce:animate-none"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between gap-3 border-b border-[#e3eae6] px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-['Unbounded',sans-serif] text-sm font-semibold text-[#14201c]">
                    Notifications
                  </h3>
                  {unread > 0 && (
                    <span className="rounded-full bg-[#0f3d33] px-2 py-0.5 text-[10px] font-bold text-white">
                      {unread} new
                    </span>
                  )}
                </div>

                {onMarkAllRead && unread > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className={
                      "flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#0f3d33] transition-colors hover:bg-[#eaf2ee] " +
                      focusRing
                    }
                  >
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>
                )}
              </div>

              {/* List */}
              {sortedNotifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f3f6f2] text-[#5b6b65]">
                    <BellOff size={20} />
                  </span>
                  <p className="text-sm font-semibold text-[#14201c]">You're all caught up</p>
                  <p className="text-xs text-[#5b6b65]">New notifications will show up here.</p>
                </div>
              ) : (
                <ul className="max-h-96 divide-y divide-[#e3eae6] overflow-y-auto">
                  {sortedNotifications.map((n) => {
                    const isUnread = n.isRead === false;
                    const Row = onNotificationClick ? "button" : "div";

                    return (
                      <li key={n._id ?? n.id}>
                        <Row
                          {...(onNotificationClick
                            ? { type: "button", onClick: () => onNotificationClick(n) }
                            : {})}
                          className={
                            "flex w-full gap-3 px-4 py-3 text-left transition-colors " +
                            (isUnread ? "bg-[#f3f6f2] " : "bg-white ") +
                            (onNotificationClick
                              ? "cursor-pointer hover:bg-[#eaf2ee] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#c9a227]"
                              : "")
                          }
                        >
                          <span
                            aria-hidden="true"
                            className={
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full " +
                              (isUnread ? "bg-[#c9a227]" : "bg-transparent")
                            }
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-3">
                              <span
                                className={
                                  "text-sm text-[#14201c] " +
                                  (isUnread ? "font-semibold" : "font-medium")
                                }
                              >
                                {n.title}
                              </span>
                              <time
                                dateTime={n.createdAt}
                                title={fullDate(n.createdAt)}
                                className="shrink-0 pt-0.5 text-[11px] font-medium text-[#5b6b65]"
                              >
                                {timeAgo(n.createdAt)}
                              </time>
                            </span>
                            {n.description && (
                              <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-[#5b6b65]">
                                {n.description}
                              </span>
                            )}
                          </span>
                        </Row>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <Link
          to="/profile"
          aria-label="Open profile"
          className={
            "rounded-full ring-2 ring-[#0f3d33] ring-offset-2 transition-all duration-200 hover:scale-105 hover:ring-[#c9a227] " +
            focusRing
          }
        >
          <img
            src={user?.avatar || "/avatar.jpg"}
            alt="Profile"
            className="h-10 w-10 cursor-pointer rounded-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
};

export default Topbar;