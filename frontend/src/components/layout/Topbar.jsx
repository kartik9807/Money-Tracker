import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fullDate,timeAgo,focusRing } from "../../utils/styleClass";
import {
  ArrowLeftRight,
  Bell,
  BellOff,
  Check,
  Info,
  Loader2,
  Search,
  Trash2,
  User,
} from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/payments": "Payments",
  "/statistics": "Statistics",
  "/profile": "Profile",
};

const categoryIcons = {
  transaction: ArrowLeftRight,
  profile: User,
};

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

//* A default like function = async () => {} is used only when the prop is undefined.
//*  Your AppLayout passes all of them, so the defaults never run there. They are a safety net in case someone renders <Topbar /> somewhere without those props.

const Topbar = ({
  user,
  notifications = [], //* [{ _id, category, title, message, read, createdAt }]
  onNotificationsClick = () => {},//* called each time the panel opens 
  onMarkRead = async () => {}, //* (id) => PATCH /read/:id,
  onDelete = async () => {}, //* (id) => DELETE /delete/:id,
  onDeleteAll = async () => {}, //* () => DELETE /deleteAll,
  onSearch = () => {},
}) => {
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  
  //* busyId is used to record the current ongoing notification request so if user click any of the function it will render a ongoing process instead of blank
  //* if multiple functionality is clicked like read and delete then all that requested notification id will be stored in this set and correspondely it will be evaluated
  //! Problem facing on ui side if static state variable is used
  //? The problem: user click "Mark read", the server takes a second, and nothing visibly happens. You'd click again, and that sends the request twice. So I need a way to say "this one is in progress".
  //? The simplest idea: const [busy, setBusy] = useState(false). Set it to true before the request and false after. This works for one button. but when multiple function are clicked then it will not re-render as it can handle only one state at a time
  //? The next flaw: if we delete A and then quickly mark B as read, busyId can only hold one of them. When the first request finishes, it clears the id and B looks idle while it's still running. I needed to hold several ids at once, which is what a Set does.
  //? React's rule: React only re-renders when it sees a new object, so I copy the set (new Set(prev)) instead of changing it in place. we already ran into this rule with map, filter and push in our provider.
  //! commonly used technique [per-item loading state]
  const [busyIds, setBusyIds] = useState(() => new Set());
  
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
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

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  const badgeCount = notifications.filter((n) => !n.read).length;

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  useEffect(() => {
    if (!panelOpen) setConfirmClear(false);
  }, [panelOpen]);

  const togglePanel = () => {
    if (!panelOpen) onNotificationsClick();
    setPanelOpen((open) => !open);
  };

  //! Runs a per-notification action and disables its buttons while it is in flight
  
  const runForId = async (id, action) => {
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      await action(id);
    } catch (error) {
      console.error("Notification action failed:", error);
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteAll = async () => {
    setClearing(true);
    try {
      await onDeleteAll();
      setConfirmClear(false);
    } catch (error) {
      console.error("Delete all notifications failed:", error);
    } finally {
      setClearing(false);
    }
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
              className="absolute right-0 top-full z-30 mt-3 w-92 max-w-[calc(100vw-2rem)] origin-top-right animate-[tb-pop_0.18s_ease-out_both] overflow-hidden rounded-2xl border border-[#cfd9d3] bg-white shadow-[0_24px_48px_-20px_rgba(15,61,51,0.45)] motion-reduce:animate-none"
            >
              <div className="flex items-center gap-2 border-b border-[#e3eae6] px-4 py-3">
                <h3 className="font-['Unbounded',sans-serif] text-sm font-semibold text-[#14201c]">
                  Notifications
                </h3>
                {badgeCount > 0 && (
                  <span className="rounded-full bg-[#0f3d33] px-2 py-0.5 text-[10px] font-bold text-white">
                    {badgeCount} new
                  </span>
                )}
              </div>

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
                    const id = n._id ?? n.id;
                    const busy = busyIds.has(id);
                    const isUnread = !n.read;
                    const CategoryIcon = categoryIcons[n.category?.toLowerCase()] ?? Info;

                    return (
                      <li
                        key={id}
                        className={
                          "flex gap-3 px-4 py-3 transition-colors duration-300 " +
                          (isUnread ? "bg-[#eaf2ee]/70 " : "bg-white ") +
                          (busy ? "opacity-60" : "")
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={
                            "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-300 " +
                            (isUnread ? "bg-[#0f3d33] text-[#c9a227]" : "bg-[#f3f6f2] text-[#8a9a93]")
                          }
                        >
                          <CategoryIcon size={17} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={
                                "flex items-center gap-2 text-sm " +
                                (isUnread ? "font-semibold text-[#14201c]" : "font-medium text-[#5b6b65]")
                              }
                            >
                              {isUnread && (
                                <span
                                  aria-hidden="true"
                                  className="h-2 w-2 shrink-0 rounded-full bg-[#c9a227]"
                                />
                              )}
                              {n.title}
                            </p>
                            <time
                              dateTime={n.createdAt}
                              title={fullDate(n.createdAt)}
                              className="shrink-0 pt-0.5 text-[11px] font-medium text-[#5b6b65]"
                            >
                              {timeAgo(n.createdAt)}
                            </time>
                          </div>

                          {n.message && (
                            <p
                              className={
                                "mt-0.5 line-clamp-3 text-xs leading-relaxed " +
                                (isUnread ? "text-[#5b6b65]" : "text-[#8a9a93]")
                              }
                            >
                              {n.message}
                            </p>
                          )}

                          <div className="mt-2 flex items-center justify-between gap-2">
                            {n.category ? (
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5b6b65] ring-1 ring-[#cfd9d3]">
                                {capitalize(n.category)}
                              </span>
                            ) : (
                              <span />
                            )}

                            <div className="flex items-center gap-1">
                              {isUnread ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => runForId(id, onMarkRead)}
                                  aria-label={`Mark "${n.title}" as read`}
                                  title="Mark as read"
                                  className={
                                    "flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#0f3d33] transition-colors hover:bg-[#eaf2ee] disabled:cursor-not-allowed " +
                                    focusRing
                                  }
                                >
                                  {busy ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <Check size={13} />
                                  )}
                                  Mark read
                                </button>
                              ) : (
                                <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#0f3d33]/60">
                                  <Check size={13} />
                                  Read
                                </span>
                              )}

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => runForId(id, onDelete)}
                                aria-label={`Delete "${n.title}"`}
                                title="Delete"
                                className={
                                  "grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-[#5b6b65] transition-colors hover:bg-[#fef3f2] hover:text-[#b42318] disabled:cursor-not-allowed " +
                                  focusRing
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {sortedNotifications.length > 0 && (
                <div className="border-t border-[#e3eae6] bg-white px-4 py-2.5">
                  {confirmClear ? (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-[#14201c]">
                        Delete all notifications?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmClear(false)}
                          disabled={clearing}
                          className={
                            "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-[#5b6b65] transition-colors hover:bg-[#f3f6f2] disabled:cursor-not-allowed " +
                            focusRing
                          }
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteAll}
                          disabled={clearing}
                          className={
                            "flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#b42318] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#912018] disabled:cursor-not-allowed disabled:opacity-60 " +
                            focusRing
                          }
                        >
                          {clearing && <Loader2 size={12} className="animate-spin" />}
                          Delete all
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      className={
                        "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-[#5b6b65] transition-colors hover:bg-[#fef3f2] hover:text-[#b42318] " +
                        focusRing
                      }
                    >
                      <Trash2 size={13} />
                      Delete all
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

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