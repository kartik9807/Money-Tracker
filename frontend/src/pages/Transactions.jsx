import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    Banknote,
    Bus,
    CalendarClock,
    Check,
    Film,
    GraduationCap,
    HeartPulse,
    Home,
    Loader2,
    PartyPopper,
    Pause,
    Sparkles,
    Pencil,
    Plus,
    Repeat2,
    RotateCcw,
    Search,
    Shirt,
    SlidersHorizontal,
    Tag,
    Trash2,
    Utensils,
    Wallet,
    X,
} from "lucide-react";

import { useAccount } from "../hooks/useAccount.jsx";
import { useTransaction } from "../hooks/useTransaction.jsx";
import { toastConfig } from "../utils/toastConfig.jsx";
import { focusRing, primaryBtn, ghostBtn } from "../utils/styleClass.jsx";

/*
  DATA CONTRACT
  Create hooks/useTransaction.jsx (backed by your transaction context provider)
  so that useTransaction() returns:

    transactions                    Transaction[] | null   (null while loading)
    recurringTransactions           RecurringTransaction[]  (optional, see below)
    addTransaction(payload)         POST, then update state. Throw if it fails.
    editTransaction(id, payload)    PATCH/PUT, then update state. Throw if it fails.
    removeTransaction(id)           DELETE, then update state. Throw if it fails.
    toggleActive(ruleId, isActive)  PATCH the rule's isActive, then update state.
                                    Throw if it fails. The new isActive must also be written
                                    into state (see "Recurring data" below).
    editRecurring(ruleId, payload)  PATCH the rule, then replace it in state (on every
                                    transaction that belongs to it, and in recurringTransactions).
                                    Throw if it fails.
    removeRecurring(ruleId)         DELETE the rule AND the transactions created from it, then
                                    filter both out of state. Throw if it fails.

  Categories are NOT fetched. They are the fixed list in CATEGORIES below.
  The backend must populate categoryId on every transaction it returns
  (including the one returned by add), e.g. populate("categoryId", "name type"),
  so that transaction.categoryId = { _id, name, type }. The page reads the
  category from that name for the label, icon and category filter.

  Recurring data
  frequency, startDate, endDate, nextRunAt and isActive live on the
  RecurringTransaction document, not on the transaction. They only reach this
  page if the backend also populates recurringTransactionId, e.g.
    populate("recurringTransactionId", "frequency startDate endDate nextRunAt isActive")
  A rule's own categoryId stays a plain id unless you populate it too. The page falls
  back to the category names found on the populated transactions, but for a rule that
  has no transaction yet, use a nested populate:
    populate({ path: "recurringTransactionId", select: "...",
               populate: { path: "categoryId", select: "name type" } })
  toggleActive must update isActive inside state: on every transaction whose
  recurringTransactionId._id equals the rule id (and in recurringTransactions, if you
  keep that list). The Recurring tab and the Paused badge read it from there.
  A rule whose start date is still in the future has no transaction yet, so to
  show it on the Recurring tab also return recurringTransactions (the user's
  rules). If you leave that out, the tab lists the rules found on the populated
  transactions.

  Payload sent to addTransaction (one endpoint handles both cases)
    one-time:  { type, amount, description, category, paymentMethod, transactionDate,
                 isRecurring: false, accountId }
    recurring: { ...same, isRecurring: true, transactionDate: startDate,
                 frequency, startDate, endDate (or null) }
    category is the category NAME (e.g. "Household"). The backend turns it into
    the user's Category document (find or create by userId + name + type) and
    stores its _id as categoryId.
    accountId is left out when the payment method is not linked to an account
    (Cash, see UNLINKED_METHODS above).
    transactionDate of a one-time transaction is never later than today.
  Payload sent to editTransaction (edits this transaction only):
               { type, amount, description, category, paymentMethod,
                 transactionDate, accountId (left out for Cash) }
  Payload sent to editRecurring (edits the rule, so it affects future entries):
               { type, amount, description, category, paymentMethod, accountId (left out for Cash),
                 frequency, endDate (or null), startDate (only while the rule has not started) }

  Theme: green #0f3d33 (main), brass #c9a227 (accent), ink #14201c, muted #5b6b65 / #829088
*/

const PAGE_SIZE = 20;

const PAYMENT_METHODS = ["UPI", "Cash", "Credit Card", "Debit Card", "Bank Transfer", "Other"];

// Payment methods that are NOT tied to a bank account. No accountId is sent for these.
const UNLINKED_METHODS = ["Cash"];
const isLinkedMethod = (method) => !UNLINKED_METHODS.includes(method);

const FREQUENCIES = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
];

const TYPE_FILTERS = [
    { key: "all", label: "All" },
    { key: "income", label: "Income" },
    { key: "expense", label: "Expenses" },
];

// Default categories. They are fixed in the app, so nothing is fetched for them.
// The category NAME is what gets sent to the backend, which maps it to the
// user's Category document.
const CATEGORIES = [
    { name: "Food", icon: Utensils },
    { name: "Social Life", icon: PartyPopper },
    { name: "Transport", icon: Bus },
    { name: "Culture", icon: Film },
    { name: "Household", icon: Home },
    { name: "Apparel", icon: Shirt },
    { name: "Beauty", icon: Sparkles },
    { name: "Health", icon: HeartPulse },
    { name: "Education", icon: GraduationCap },
    { name: "Other", icon: Tag },
];

// Loose comparison so "socialLife", "Social Life" and "social life" all match
const categoryKey = (value = "") => String(value).toLowerCase().replace(/\s+/g, "");
const findCategory = (name) =>
    CATEGORIES.find((item) => categoryKey(item.name) === categoryKey(name));

const fieldClass =
    "w-full rounded-xl border border-[#cfd9d3] bg-white px-3.5 py-2.5 text-sm text-[#14201c] outline-none transition-all duration-200 placeholder:text-[#8a9a93] hover:border-[#0f3d33]/50 focus:border-[#0f3d33] focus:ring-4 focus:ring-[#c9a227]/25 disabled:cursor-not-allowed disabled:bg-[#f3f6f2]";

const labelClass = "mb-1.5 block text-sm font-medium text-[#14201c]";

/* ------------------------------------------------------------------ */
/* Formatting and date helpers                                         */
/* ------------------------------------------------------------------ */

const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

const titleCase = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

// Local "YYYY-MM-DD". (toISOString() uses UTC and gives yesterday's date
// in India between 12:00 am and 5:30 am.)
const toInputDate = (date = new Date()) =>
    [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");

const today = () => toInputDate();

const parseInputDate = (value) => new Date(`${value}T00:00:00`);

const formatShortDate = (value) =>
    parseInputDate(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const dayLabel = (value) => {
    const date = parseInputDate(value);
    const diff = Math.round((parseInputDate(today()) - date) / 86400000);

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";

    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    });
};

// Next occurrence for the schedule preview (month ends are clamped, e.g. 31 Jan -> 28 Feb)
const addInterval = (value, frequency) => {
    const date = parseInputDate(value);
    const day = date.getDate();

    if (frequency === "daily") {
        date.setDate(day + 1);
    } else if (frequency === "weekly") {
        date.setDate(day + 7);
    } else {
        date.setDate(1);
        if (frequency === "monthly") date.setMonth(date.getMonth() + 1);
        else date.setFullYear(date.getFullYear() + 1);

        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        date.setDate(Math.min(day, lastDay));
    }

    return toInputDate(date);
};

// Used by the edit-recurring dialog while the start date can still change
const previewSchedule = (startDate, frequency, endDate) => {
    if (!startDate) return null;

    const next = addInterval(startDate, frequency);

    return {
        startsNow: startDate <= today(),
        next: !endDate || next <= endDate ? next : null,
    };
};

/* ------------------------------------------------------------------ */
/* Backend shape -> flat shape used by this page                       */
/* Handles ids that are plain strings or populated objects.            */
/* If your API uses other field names, change them here only.          */
/* ------------------------------------------------------------------ */

const toDay = (value) => (value ? String(value).slice(0, 10) : "");

const refId = (value) => (value && typeof value === "object" ? value._id : value);
const refName = (value) => (value && typeof value === "object" ? value.name : undefined);

const normalizeTransaction = (item) => {
    const rule =
        item.recurringTransactionId && typeof item.recurringTransactionId === "object"
            ? item.recurringTransactionId
            : null;

    return {
        id: item._id ?? item.id,
        type: item.type,
        amount: Number(item.amount) || 0,
        description: item.description ?? "",
        // categoryId is populated by the backend: { _id, name, type }
        categoryName:
            refName(item.categoryId) ??
            (typeof item.category === "string" ? item.category : undefined),
        accountId: refId(item.accountId),
        accountName: refName(item.accountId),
        transactionDate: String(item.transactionDate ?? "").slice(0, 10),
        paymentMethod: item.paymentMethod ?? "",
        isRecurring: Boolean(item.isRecurring || item.recurringTransactionId),
        // These come from the populated RecurringTransaction
        ruleId: refId(item.recurringTransactionId),
        ruleActive: rule ? rule.isActive !== false : undefined,
        frequency: rule?.frequency ?? item.frequency,
        nextRunAt: toDay(rule?.nextRunAt),
        createdAt: item.createdAt ?? "",
    };
};

const normalizeRule = (rule) => ({
    id: rule._id ?? rule.id,
    type: rule.type,
    amount: Number(rule.amount) || 0,
    description: rule.description ?? "",
    categoryId: refId(rule.categoryId),
    // A rule's categoryId is usually just an id (populating recurringTransactionId does not
    // populate the category inside it). The name is then looked up from the transactions.
    categoryName:
        refName(rule.categoryId) ?? (typeof rule.category === "string" ? rule.category : undefined),
    accountId: refId(rule.accountId),
    accountName: refName(rule.accountId),
    paymentMethod: rule.paymentMethod ?? "",
    frequency: rule.frequency,
    startDate: toDay(rule.startDate),
    endDate: toDay(rule.endDate),
    nextRunAt: toDay(rule.nextRunAt),
    isActive: rule.isActive !== false,
});

const emptyForm = (accountId = "") => ({
    type: "expense",
    amount: "",
    description: "",
    category: CATEGORIES[0].name,
    accountId,
    transactionDate: today(),
    paymentMethod: "UPI",
    isRecurring: false,
    frequency: "monthly",
    startDate: today(),
    endDate: "",
});

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

const useCountUp = (target, duration = 700) => {
    const [value, setValue] = useState(0);
    const [from, setFrom] = useState(0);

    useEffect(() => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setValue(target);
            setFrom(target);
            return;
        }

        const start = performance.now();
        const origin = from;
        let frame;

        const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(origin + (target - origin) * eased);

            if (progress < 1) frame = requestAnimationFrame(tick);
            else setFrom(target);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, duration]);

    return Math.round(value * 100) / 100;
};

const Segmented = ({ options, value, onChange, label, size = "md", className = "" }) => (
    <div
        role="group"
        aria-label={label}
        className={"inline-flex rounded-xl border border-[#cfd9d3] bg-white p-1 " + className}
    >
        {options.map((option) => {
            const active = option.key === value;

            return (
                <button
                    key={option.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange(option.key)}
                    className={
                        "flex-1 cursor-pointer rounded-lg font-semibold transition-all duration-200 " +
                        (size === "sm" ? "px-3 py-1 text-xs " : "px-3.5 py-1.5 text-sm ") +
                        (active
                            ? "bg-[#0f3d33] text-white shadow-sm "
                            : "text-[#5b6b65] hover:bg-[#eaf2ee] hover:text-[#0f3d33] ") +
                        focusRing
                    }
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);

const SummaryCard = ({ title, amount, description, icon: Icon, variant = "light", negative }) => {
    const dark = variant === "dark";
    const shown = useCountUp(amount);

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 ${
                dark
                    ? "border-[#0f3d33] bg-[#0f3d33] text-white shadow-[0_18px_32px_-20px_rgba(15,61,51,0.9)]"
                    : "border-[#e3eae6] bg-white hover:border-[#cfd9d3] hover:shadow-[0_14px_28px_-20px_rgba(15,61,51,0.5)]"
            }`}
        >
            {dark && (
                <>
                    <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#c9a227]/20" />
                    <div className="pointer-events-none absolute inset-0 bg-[image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(255,255,255,0.05)_31px,rgba(255,255,255,0.05)_32px)]" />
                </>
            )}

            <div className="relative flex items-center justify-between gap-3">
                <p className={`text-sm ${dark ? "text-white/70" : "text-[#5b6b65]"}`}>{title}</p>
                <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        dark ? "bg-white/10 text-[#e5cb72]" : "bg-[#f3f6f2] text-[#0f3d33]"
                    }`}
                >
                    <Icon size={19} />
                </span>
            </div>

            <p
                className={`relative mt-5 break-words text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl ${
                    negative ? "text-[#ff9b8f]" : ""
                }`}
            >
                {formatMoney(shown)}
            </p>

            <p className={`relative mt-2 text-xs ${dark ? "text-white/65" : "text-[#829088]"}`}>
                {description}
            </p>
        </div>
    );
};

const TypeToggle = ({ value, onChange }) => (
    <div role="radiogroup" aria-label="Transaction type" className="grid grid-cols-2 gap-3">
        {["expense", "income"].map((type) => {
            const selected = value === type;
            const TypeIcon = type === "income" ? ArrowDownLeft : ArrowUpRight;

            return (
                <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(type)}
                    className={
                        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] " +
                        (selected
                            ? type === "income"
                                ? "border-[#0f3d33] bg-[#eaf2ee] text-[#0f3d33] ring-4 ring-[#c9a227]/20 "
                                : "border-[#b4533c] bg-[#fbefeb] text-[#b4533c] ring-4 ring-[#b4533c]/10 "
                            : "border-[#cfd9d3] text-[#5b6b65] hover:border-[#0f3d33]/50 hover:bg-[#f7f9f7] ") +
                        focusRing
                    }
                >
                    <TypeIcon size={17} />
                    {type === "income" ? "Income" : "Expense"}
                </button>
            );
        })}
    </div>
);

const Transactions = () => {
    const { Accounts } = useAccount();
    const {
        transactions,
        recurringTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
        toggleActive,
        editRecurring,
        removeRecurring,
    } = useTransaction();
    const accounts = useMemo(
        () =>
            (Accounts ?? []).map((item) => ({
                id: item._id ?? item.id,
                name: item.name ?? item.accountName ?? "",
            })),
        [Accounts]
    );

    const isLoading = transactions == null;

    const [form, setForm] = useState(() => emptyForm());
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingRecurring, setEditingRecurring] = useState(false);
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [removeTarget, setRemoveTarget] = useState(null);
    const [removeError, setRemoveError] = useState("");
    const [isRemoving, setIsRemoving] = useState(false);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [accountFilter, setAccountFilter] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [view, setView] = useState("transactions"); // "transactions" | "recurring"
    const [togglingIds, setTogglingIds] = useState(() => new Set());

    // Editing / deleting a recurring rule
    const [editingRule, setEditingRule] = useState(null);
    const [ruleForm, setRuleForm] = useState(null);
    const [ruleError, setRuleError] = useState("");
    const [isSavingRule, setIsSavingRule] = useState(false);
    const [ruleRemoveTarget, setRuleRemoveTarget] = useState(null);
    const [ruleRemoveError, setRuleRemoveError] = useState("");
    const [isRemovingRule, setIsRemovingRule] = useState(false);

    const accountMap = useMemo(() => new Map(accounts.map((item) => [item.id, item])), [accounts]);

    // Flat, display-ready list (names resolved, search text prepared once)
    const allTransactions = useMemo(
        () =>
            (transactions ?? []).map((item) => {
                const base = normalizeTransaction(item);
                const categoryLabel =
                    findCategory(base.categoryName)?.name || base.categoryName || "Uncategorized";
                // Cash (and other unlinked) transactions have no account
                const accountLabel = base.accountId
                    ? accountMap.get(base.accountId)?.name || base.accountName || "Account"
                    : "";

                return {
                    ...base,
                    categoryLabel,
                    accountLabel,
                    searchText: [base.description, categoryLabel, accountLabel, base.paymentMethod]
                        .join(" ")
                        .toLowerCase(),
                };
            }),
        [transactions, accountMap]
    );

    // Category names seen on the populated transactions (id -> name). A rule only carries
    // categoryId as a plain id, so its category name is looked up here.
    const categoryNameById = useMemo(() => {
        const map = new Map();

        (transactions ?? []).forEach((item) => {
            const category = item.categoryId;

            if (category && typeof category === "object" && category._id) {
                map.set(category._id, category.name);
            }
        });

        return map;
    }, [transactions]);

    // Recurring rules: the list from the hook when it has one, otherwise the rules found
    // on the populated recurringTransactionId of the transactions
    const rules = useMemo(() => {
        const fromTransactions = [
            ...new Map(
                (transactions ?? [])
                    .map((item) => item.recurringTransactionId)
                    .filter((rule) => rule && typeof rule === "object")
                    .map((rule) => [rule._id ?? rule.id, rule])
            ).values(),
        ];

        const source = recurringTransactions?.length ? recurringTransactions : fromTransactions;

        return source
            .map(normalizeRule)
            .map((rule) => {
                const categoryName = rule.categoryName ?? categoryNameById.get(rule.categoryId);

                return {
                    ...rule,
                    categoryLabel:
                        findCategory(categoryName)?.name || categoryName || "Uncategorized",
                    accountLabel: rule.accountId
                        ? accountMap.get(rule.accountId)?.name || rule.accountName || "Account"
                        : "",
                };
            })
            .sort(
                (a, b) =>
                    Number(b.isActive) - Number(a.isActive) ||
                    (a.nextRunAt || "9999").localeCompare(b.nextRunAt || "9999")
            );
    }, [recurringTransactions, transactions, accountMap, categoryNameById]);

    const filteredTransactions = useMemo(() => {
        const term = search.trim().toLowerCase();

        return allTransactions
            .filter(
                (item) =>
                    (!term || item.searchText.includes(term)) &&
                    (typeFilter === "all" || item.type === typeFilter) &&
                    (categoryFilter === "all" ||
                        categoryKey(item.categoryLabel) === categoryKey(categoryFilter)) &&
                    (accountFilter === "all" ||
                        (accountFilter === "none" ? !item.accountId : item.accountId === accountFilter)) &&
                    (!fromDate || item.transactionDate >= fromDate) &&
                    (!toDate || item.transactionDate <= toDate)
            )
            .sort(
                (a, b) =>
                    b.transactionDate.localeCompare(a.transactionDate) ||
                    String(b.createdAt).localeCompare(String(a.createdAt))
            );
    }, [allTransactions, search, typeFilter, categoryFilter, accountFilter, fromDate, toDate]);

    const totals = useMemo(
        () =>
            filteredTransactions.reduce(
                (result, item) => {
                    if (item.type === "income") {
                        result.income += item.amount;
                        result.incomeCount += 1;
                    } else if (item.type === "expense") {
                        result.expenses += item.amount;
                        result.expenseCount += 1;
                    }
                    return result;
                },
                { income: 0, expenses: 0, incomeCount: 0, expenseCount: 0 }
            ),
        [filteredTransactions]
    );

    const visibleTransactions = filteredTransactions.slice(0, visibleCount);
    const remaining = filteredTransactions.length - visibleTransactions.length;

    // Group the visible rows by day (the list is already sorted newest first)
    const groups = useMemo(() => {
        const byDay = new Map();

        visibleTransactions.forEach((item) => {
            if (!byDay.has(item.transactionDate)) byDay.set(item.transactionDate, []);
            byDay.get(item.transactionDate).push(item);
        });

        return [...byDay.entries()].map(([date, items]) => ({
            date,
            items,
            net: items.reduce(
                (sum, item) =>
                    item.type === "income"
                        ? sum + item.amount
                        : item.type === "expense"
                          ? sum - item.amount
                          : sum,
                0
            ),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredTransactions, visibleCount]);

    // Back to the first page whenever a filter changes
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [search, typeFilter, categoryFilter, accountFilter, fromDate, toDate]);

    const activeChips = [
        categoryFilter !== "all" && {
            key: "category",
            label: categoryFilter,
            clear: () => setCategoryFilter("all"),
        },
        accountFilter !== "all" && {
            key: "account",
            label:
                accountFilter === "none"
                    ? "No account (cash)"
                    : accountMap.get(accountFilter)?.name || "Account",
            clear: () => setAccountFilter("all"),
        },
        fromDate && {
            key: "from",
            label: `From ${formatShortDate(fromDate)}`,
            clear: () => setFromDate(""),
        },
        toDate && {
            key: "to",
            label: `Until ${formatShortDate(toDate)}`,
            clear: () => setToDate(""),
        },
    ].filter(Boolean);

    const hasActiveFilters = activeChips.length > 0 || typeFilter !== "all" || search.trim() !== "";

    const resetFilters = () => {
        setSearch("");
        setTypeFilter("all");
        setCategoryFilter("all");
        setAccountFilter("all");
        setFromDate("");
        setToDate("");
    };

    /* Recurring schedule preview. Display only: the backend decides the real dates. */
    const schedule = useMemo(() => {
        if (!form.isRecurring || !form.startDate) return null;

        const startsNow = form.startDate <= today();
        const next = addInterval(form.startDate, form.frequency);
        const hasNext = !form.endDate || next <= form.endDate;

        return { startsNow, next: hasNext ? next : null };
    }, [form.isRecurring, form.startDate, form.frequency, form.endDate]);

    /* Escape closes dialogs; the page behind them stops scrolling */
    const dialogOpen = showForm || !!removeTarget || !!editingRule || !!ruleRemoveTarget;

    useEffect(() => {
        if (!dialogOpen) return;

        const onKeyDown = (event) => {
            if (event.key !== "Escape") return;

            if (ruleRemoveTarget) {
                if (!isRemovingRule) setRuleRemoveTarget(null);
            } else if (removeTarget) {
                if (!isRemoving) setRemoveTarget(null);
            } else if (editingRule) {
                if (!isSavingRule) {
                    setEditingRule(null);
                    setRuleForm(null);
                    setRuleError("");
                }
            } else if (!isSaving) {
                setShowForm(false);
                setEditingId(null);
                setFormError("");
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [
        dialogOpen,
        removeTarget,
        isRemoving,
        isSaving,
        editingRule,
        isSavingRule,
        ruleRemoveTarget,
        isRemovingRule,
    ]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const pickType = (type) => setForm((previous) => ({ ...previous, type }));

    // Switching to a linked method needs an account, so pick one if none is set
    const pickMethod = (event) => {
        const method = event.target.value;

        setForm((previous) => ({
            ...previous,
            paymentMethod: method,
            accountId:
                previous.accountId || (isLinkedMethod(method) ? (accounts[0]?.id ?? "") : ""),
        }));
    };

    const openAddForm = () => {
        setEditingId(null);
        setEditingRecurring(false);
        setForm(emptyForm(accounts[0]?.id ?? ""));
        setFormError("");
        setShowForm(true);
    };

    const openEditForm = (item) => {
        setEditingId(item.id);
        setEditingRecurring(item.isRecurring);
        setForm({
            ...emptyForm(item.accountId ?? ""),
            category: findCategory(item.categoryLabel)?.name ?? "Other",
            type: item.type === "income" ? "income" : "expense",
            amount: String(item.amount),
            description: item.description,
            transactionDate: item.transactionDate || today(),
            paymentMethod: item.paymentMethod || "UPI",
        });
        setFormError("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        const linked = isLinkedMethod(form.paymentMethod);

        if (!form.description.trim()) return setFormError("Please enter a description.");
        if (!form.amount || Number(form.amount) <= 0)
            return setFormError("Amount must be greater than zero.");
        if (linked && !form.accountId) return setFormError("Please select an account.");
        if (!form.category) return setFormError("Please select a category.");

        const recurring = form.isRecurring && !editingId;

        if (recurring) {
            if (!form.startDate) return setFormError("Please choose a start date.");
            if (form.endDate && form.endDate < form.startDate)
                return setFormError("End date must be on or after the start date.");
        } else if (!form.transactionDate) {
            return setFormError("Please select a transaction date.");
        } else if (form.transactionDate > today()) {
            return setFormError("Transaction date can't be in the future.");
        }

        const base = {
            type: form.type,
            amount: Number(form.amount),
            description: form.description.trim(),
            category: form.category,
            paymentMethod: form.paymentMethod,
            // Cash is not linked to an account, so no accountId is sent
            ...(linked ? { accountId: form.accountId } : {}),
        };

        let payload;

        if (editingId) {
            payload = { ...base, transactionDate: form.transactionDate };
        } else if (recurring) {
            payload = {
                ...base,
                isRecurring: true,
                transactionDate: form.startDate,
                frequency: form.frequency,
                startDate: form.startDate,
                endDate: form.endDate || null,
            };
        } else {
            payload = { ...base, isRecurring: false, transactionDate: form.transactionDate };
        }

        try {
            setIsSaving(true);

            if (editingId) await editTransaction(editingId, payload);
            else await addTransaction(payload);

            toast.success(
                editingId
                    ? "Transaction updated"
                    : recurring
                      ? "Recurring transaction saved"
                      : "Transaction added",
                toastConfig
            );
            closeForm();
        } catch (error) {
            setFormError(
                error?.response?.data?.message || error?.message || "Could not save the transaction."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const confirmRemove = async () => {
        if (!removeTarget) return;

        try {
            setIsRemoving(true);
            setRemoveError("");

            await removeTransaction(removeTarget.id);

            toast.success("Transaction deleted", toastConfig);
            setRemoveTarget(null);
        } catch (error) {
            setRemoveError(
                error?.response?.data?.message || error?.message || "Could not delete the transaction."
            );
        } finally {
            setIsRemoving(false);
        }
    };

    // Pause / resume a recurring rule. toggleActive should PATCH isActive on the
    // RecurringTransaction and update state. It receives the rule id and the new value.
    const handleToggleRule = async (rule) => {
        const nextActive = !rule.isActive;

        setTogglingIds((previous) => new Set(previous).add(rule.id));

        try {
            await toggleActive(rule.id, nextActive);

            toast.success(
                nextActive ? "Recurring transaction resumed" : "Recurring transaction paused",
                toastConfig
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Could not update the recurring transaction.",
                toastConfig
            );
        } finally {
            setTogglingIds((previous) => {
                const next = new Set(previous);
                next.delete(rule.id);
                return next;
            });
        }
    };

    /* Recurring rules: edit and delete */

    const openEditRule = (rule) => {
        setEditingRule(rule);
        setRuleForm({
            type: rule.type === "income" ? "income" : "expense",
            amount: String(rule.amount),
            description: rule.description,
            category: findCategory(rule.categoryLabel)?.name ?? "Other",
            paymentMethod: rule.paymentMethod || "UPI",
            accountId: rule.accountId ?? "",
            frequency: rule.frequency || "monthly",
            startDate: rule.startDate || today(),
            endDate: rule.endDate || "",
        });
        setRuleError("");
    };

    const closeEditRule = () => {
        setEditingRule(null);
        setRuleForm(null);
        setRuleError("");
    };

    const updateRuleField = (event) => {
        const { name, value } = event.target;
        setRuleForm((previous) => ({ ...previous, [name]: value }));
    };

    const pickRuleMethod = (event) => {
        const method = event.target.value;

        setRuleForm((previous) => ({
            ...previous,
            paymentMethod: method,
            accountId:
                previous.accountId || (isLinkedMethod(method) ? (accounts[0]?.id ?? "") : ""),
        }));
    };

    const handleRuleSubmit = async (event) => {
        event.preventDefault();
        if (!editingRule || !ruleForm) return;

        setRuleError("");

        const linked = isLinkedMethod(ruleForm.paymentMethod);
        const startLocked = !!editingRule.startDate && editingRule.startDate <= today();

        if (!ruleForm.description.trim()) return setRuleError("Please enter a description.");
        if (!ruleForm.amount || Number(ruleForm.amount) <= 0)
            return setRuleError("Amount must be greater than zero.");
        if (linked && !ruleForm.accountId) return setRuleError("Please select an account.");
        if (!startLocked && !ruleForm.startDate) return setRuleError("Please choose a start date.");
        if (ruleForm.endDate && ruleForm.endDate < ruleForm.startDate)
            return setRuleError("End date must be on or after the start date.");

        const payload = {
            type: ruleForm.type,
            amount: Number(ruleForm.amount),
            description: ruleForm.description.trim(),
            category: ruleForm.category,
            paymentMethod: ruleForm.paymentMethod,
            // Cash is not linked to an account, so no accountId is sent
            ...(linked ? { accountId: ruleForm.accountId } : {}),
            frequency: ruleForm.frequency,
            endDate: ruleForm.endDate || null,
            // The start date cannot change once the rule has started
            ...(startLocked ? {} : { startDate: ruleForm.startDate }),
        };

        try {
            setIsSavingRule(true);

            await editRecurring(editingRule.id, payload);

            toast.success("Recurring transaction updated", toastConfig);
            closeEditRule();
        } catch (error) {
            setRuleError(
                error?.response?.data?.message ||
                    error?.message ||
                    "Could not update the recurring transaction."
            );
        } finally {
            setIsSavingRule(false);
        }
    };

    // How many transactions were created from a rule (they are deleted with it)
    const ruleEntryCount = (ruleId) =>
        allTransactions.filter((item) => item.ruleId === ruleId).length;

    const confirmRemoveRule = async () => {
        if (!ruleRemoveTarget) return;

        try {
            setIsRemovingRule(true);
            setRuleRemoveError("");

            await removeRecurring(ruleRemoveTarget.id);

            toast.success("Recurring transaction deleted", toastConfig);
            setRuleRemoveTarget(null);
        } catch (error) {
            setRuleRemoveError(
                error?.response?.data?.message ||
                    error?.message ||
                    "Could not delete the recurring transaction."
            );
        } finally {
            setIsRemovingRule(false);
        }
    };

    const riseClass = "animate-[tx-rise_0.5s_ease-out_both] motion-reduce:animate-none";
    const rise = (delay) => ({ animationDelay: `${delay}ms` });

    const needsAccount = isLinkedMethod(form.paymentMethod);
    const noAccounts = accounts.length === 0;

    const ruleStartLocked =
        !!editingRule && !!editingRule.startDate && editingRule.startDate <= today();
    const ruleNeedsAccount = ruleForm ? isLinkedMethod(ruleForm.paymentMethod) : false;
    const rulePreview =
        ruleForm && !ruleStartLocked
            ? previewSchedule(ruleForm.startDate, ruleForm.frequency, ruleForm.endDate)
            : null;
    const removeRuleEntries = ruleRemoveTarget ? ruleEntryCount(ruleRemoveTarget.id) : 0;

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10 font-['Figtree',system-ui,sans-serif] text-[#14201c]">
            <style>{`
                @keyframes tx-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes tx-pop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
            `}</style>

            {/* Heading */}
            <div
                style={rise(0)}
                className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${riseClass}`}
            >
                <div className="flex items-center gap-3">
                    <span className="h-14 w-1.5 shrink-0 rounded-full bg-[#0f3d33]" aria-hidden="true" />
                    <div>
                        <h1 className="font-['Unbounded',sans-serif] text-2xl font-semibold tracking-tight">
                            Transactions
                        </h1>
                        <p className="mt-1 text-sm text-[#5b6b65]">
                            Manage your income, expenses, and recurring payments.
                        </p>
                    </div>
                </div>

                <button type="button" onClick={openAddForm} className={primaryBtn + " justify-center"}>
                    <Plus size={17} />
                    Add transaction
                </button>
            </div>

            {/* Summary */}
            <div
                style={rise(60)}
                className={`grid grid-cols-1 gap-4 sm:grid-cols-3 ${riseClass}`}
            >
                <SummaryCard
                    title="Income"
                    amount={totals.income}
                    description={`${totals.incomeCount} ${totals.incomeCount === 1 ? "entry" : "entries"} in view`}
                    icon={ArrowDownLeft}
                />
                <SummaryCard
                    title="Expenses"
                    amount={totals.expenses}
                    description={`${totals.expenseCount} ${totals.expenseCount === 1 ? "entry" : "entries"} in view`}
                    icon={ArrowUpRight}
                />
                <SummaryCard
                    title="Net"
                    amount={totals.income - totals.expenses}
                    negative={totals.income - totals.expenses < 0}
                    description="Income minus expenses, for the current filters"
                    icon={Wallet}
                    variant="dark"
                />
            </div>

            {/* List */}
            <section
                style={rise(120)}
                className={`overflow-hidden rounded-2xl border border-[#e3eae6] bg-white ${riseClass}`}
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ee] px-4 py-3 sm:px-5">
                    <Segmented
                        options={[
                            { key: "transactions", label: "Transactions" },
                            {
                                key: "recurring",
                                label: `Recurring${rules.length ? ` (${rules.length})` : ""}`,
                            },
                        ]}
                        value={view}
                        onChange={setView}
                        label="List view"
                        size="sm"
                    />

                    {view === "recurring" && (
                        <p className="text-xs text-[#829088]">
                            Pause a rule to stop new entries from being created.
                        </p>
                    )}
                </div>

                {view === "transactions" && (
                    <>
                <div className="border-b border-[#edf1ee] p-4 sm:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-transparent bg-[#f3f6f2] px-3.5 py-2.5 transition-all duration-200 focus-within:border-[#0f3d33] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#c9a227]/20">
                            <Search size={16} className="shrink-0 text-[#829088]" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search description, category, account or payment method..."
                                aria-label="Search transactions"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#829088]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className={
                                        "grid h-5 w-5 shrink-0 cursor-pointer place-items-center rounded-full text-[#829088] hover:bg-[#e3eae6] hover:text-[#14201c] " +
                                        focusRing
                                    }
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Segmented
                                options={TYPE_FILTERS}
                                value={typeFilter}
                                onChange={setTypeFilter}
                                label="Transaction type"
                                size="sm"
                            />

                            <button
                                type="button"
                                onClick={() => setShowFilters((previous) => !previous)}
                                aria-expanded={showFilters}
                                className={
                                    "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 " +
                                    (showFilters
                                        ? "border-[#0f3d33] bg-[#eaf2ee] text-[#0f3d33] "
                                        : "border-[#cfd9d3] text-[#14201c] hover:border-[#0f3d33] hover:bg-[#eaf2ee] ") +
                                    focusRing
                                }
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {activeChips.length > 0 && (
                                    <span className="rounded-full bg-[#0f3d33] px-2 py-0.5 text-[10px] font-bold text-white">
                                        {activeChips.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 grid animate-[tx-pop_0.2s_ease-out_both] grid-cols-1 gap-4 rounded-xl bg-[#f3f6f2] p-4 motion-reduce:animate-none sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label htmlFor="filterCategory" className={labelClass}>
                                    Category
                                </label>
                                <select
                                    id="filterCategory"
                                    value={categoryFilter}
                                    onChange={(event) => setCategoryFilter(event.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="all">All categories</option>
                                    {CATEGORIES.map((item) => (
                                        <option key={item.name} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="filterAccount" className={labelClass}>
                                    Account
                                </label>
                                <select
                                    id="filterAccount"
                                    value={accountFilter}
                                    onChange={(event) => setAccountFilter(event.target.value)}
                                    className={fieldClass}
                                >
                                    <option value="all">All accounts</option>
                                    <option value="none">No account (cash)</option>
                                    {accounts.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="filterFrom" className={labelClass}>
                                    From date
                                </label>
                                <input
                                    id="filterFrom"
                                    type="date"
                                    max={toDate || undefined}
                                    value={fromDate}
                                    onChange={(event) => setFromDate(event.target.value)}
                                    className={fieldClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="filterTo" className={labelClass}>
                                    To date
                                </label>
                                <input
                                    id="filterTo"
                                    type="date"
                                    min={fromDate || undefined}
                                    value={toDate}
                                    onChange={(event) => setToDate(event.target.value)}
                                    className={fieldClass}
                                />
                            </div>
                        </div>
                    )}

                    {/* Active filter chips */}
                    {activeChips.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {activeChips.map((chip) => (
                                <span
                                    key={chip.key}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf2ee] py-1 pl-3 pr-1.5 text-xs font-semibold text-[#0f3d33]"
                                >
                                    {chip.label}
                                    <button
                                        type="button"
                                        onClick={chip.clear}
                                        aria-label={`Remove filter ${chip.label}`}
                                        className={
                                            "grid h-4 w-4 cursor-pointer place-items-center rounded-full hover:bg-[#0f3d33] hover:text-white " +
                                            focusRing
                                        }
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}

                            <button
                                type="button"
                                onClick={resetFilters}
                                className={
                                    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#5b6b65] transition-colors hover:text-[#0f3d33] " +
                                    focusRing
                                }
                            >
                                <RotateCcw size={12} />
                                Clear all
                            </button>
                        </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-sm text-[#5b6b65]">
                        <span>
                            Showing <strong className="text-[#14201c]">{visibleTransactions.length}</strong> of{" "}
                            <strong className="text-[#14201c]">{filteredTransactions.length}</strong>
                        </span>
                        <span className="hidden text-xs text-[#829088] sm:inline">
                            Newest first
                        </span>
                    </div>
                </div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="divide-y divide-[#edf1ee]" aria-busy="true">
                        {[0, 1, 2, 3, 4].map((item) => (
                            <div key={item} className="flex animate-pulse items-center gap-4 px-5 py-4">
                                <span className="h-11 w-11 rounded-xl bg-[#eef2ef]" />
                                <div className="flex-1 space-y-2">
                                    <span className="block h-3 w-1/3 rounded bg-[#eef2ef]" />
                                    <span className="block h-2.5 w-1/2 rounded bg-[#f3f6f2]" />
                                </div>
                                <span className="h-4 w-20 rounded bg-[#eef2ef]" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty states */}
                {!isLoading && filteredTransactions.length === 0 && (
                    <div className="px-5 py-16 text-center">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf2ee] text-[#0f3d33]">
                            <Wallet size={26} />
                        </span>

                        {allTransactions.length === 0 ? (
                            <>
                                <h3 className="mt-4 text-sm font-semibold">No transactions yet</h3>
                                <p className="mt-1 text-xs text-[#829088]">
                                    Record your first income or expense to see it here.
                                </p>
                                <button
                                    type="button"
                                    onClick={openAddForm}
                                    className={primaryBtn + " mx-auto mt-4"}
                                >
                                    <Plus size={16} />
                                    Add transaction
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="mt-4 text-sm font-semibold">No matching transactions</h3>
                                <p className="mt-1 text-xs text-[#829088]">
                                    Try a different search or change your filters.
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className={ghostBtn + " mx-auto mt-4"}
                                    >
                                        <RotateCcw size={15} />
                                        Clear filters
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Grouped rows */}
                {!isLoading &&
                    groups.map((group) => (
                        <div key={group.date}>
                            <div className="flex items-center justify-between gap-3 border-y border-[#edf1ee] bg-[#f7f9f7] px-5 py-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#5b6b65]">
                                    {dayLabel(group.date)}
                                </p>
                                <p
                                    className={`text-xs font-semibold tabular-nums ${
                                        group.net < 0 ? "text-[#b4533c]" : "text-[#0f766e]"
                                    }`}
                                >
                                    {group.net < 0 ? "−" : "+"}
                                    {formatMoney(Math.abs(group.net))}
                                </p>
                            </div>

                            <div className="divide-y divide-[#edf1ee]">
                                {group.items.map((item) => {
                                    const isIncome = item.type === "income";
                                    const isTransfer = item.type === "transfer";
                                    const Icon = isIncome
                                        ? ArrowDownLeft
                                        : isTransfer
                                          ? ArrowLeftRight
                                          : (findCategory(item.categoryLabel)?.icon ?? Tag);

                                    return (
                                        <div
                                            key={item.id}
                                            className="group flex flex-col gap-3 px-4 py-4 transition-colors duration-200 hover:bg-[#fafcfb] sm:flex-row sm:items-center sm:px-5"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                <span
                                                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
                                                        isIncome
                                                            ? "bg-[#eaf2ee] text-[#0f766e]"
                                                            : isTransfer
                                                              ? "bg-[#e9eef9] text-[#4766a8]"
                                                              : "bg-[#fbefeb] text-[#b4533c]"
                                                    }`}
                                                >
                                                    <Icon size={20} />
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-semibold">
                                                            {item.description}
                                                        </p>
                                                        {item.isRecurring && (
                                                            <span
                                                                title={
                                                                    item.nextRunAt && item.ruleActive !== false
                                                                        ? `Next run ${formatShortDate(item.nextRunAt)}`
                                                                        : undefined
                                                                }
                                                                className={
                                                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                                                                    (item.ruleActive === false
                                                                        ? "bg-[#eef2ef] text-[#5b6b65]"
                                                                        : "bg-[#f8f0d8] text-[#8b6a12]")
                                                                }
                                                            >
                                                                {item.ruleActive === false ? (
                                                                    <Pause size={11} />
                                                                ) : (
                                                                    <Repeat2 size={11} />
                                                                )}
                                                                {item.ruleActive === false
                                                                    ? "Paused"
                                                                    : item.frequency
                                                                      ? titleCase(item.frequency)
                                                                      : "Recurring"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 truncate text-xs text-[#829088]">
                                                        {[
                                                            titleCase(item.categoryLabel),
                                                            item.accountLabel,
                                                            item.paymentMethod,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                                <p
                                                    className={`whitespace-nowrap text-sm font-semibold tabular-nums ${
                                                        isIncome ? "text-[#0f766e]" : "text-[#14201c]"
                                                    }`}
                                                >
                                                    {isIncome ? "+" : isTransfer ? "" : "−"}
                                                    {formatMoney(item.amount)}
                                                </p>

                                                <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                                                    {!isTransfer && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditForm(item)}
                                                            aria-label={`Edit ${item.description}`}
                                                            className={
                                                                "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#5b6b65] transition-colors hover:bg-[#eaf2ee] hover:text-[#0f3d33] " +
                                                                focusRing
                                                            }
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRemoveError("");
                                                            setRemoveTarget(item);
                                                        }}
                                                        aria-label={`Delete ${item.description}`}
                                                        className={
                                                            "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#5b6b65] transition-colors hover:bg-[#fef3f2] hover:text-[#b42318] " +
                                                            focusRing
                                                        }
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                {!isLoading && remaining > 0 && (
                    <div className="border-t border-[#edf1ee] p-4">
                        <button
                            type="button"
                            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                            className={
                                "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#0f3d33]/40 py-3 text-sm font-semibold text-[#0f3d33] transition-all duration-200 hover:border-solid hover:border-[#0f3d33] hover:bg-[#eaf2ee] active:scale-[0.99] " +
                                focusRing
                            }
                        >
                            Show {Math.min(PAGE_SIZE, remaining)} more
                            <span className="text-xs font-medium text-[#5b6b65]">({remaining} left)</span>
                        </button>
                    </div>
                )}
                    </>
                )}

                {/* Recurring rules */}
                {view === "recurring" && (
                    <div>
                        {rules.length === 0 ? (
                            <div className="px-5 py-16 text-center">
                                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f8f0d8] text-[#8b6a12]">
                                    <Repeat2 size={26} />
                                </span>
                                <h3 className="mt-4 text-sm font-semibold">No recurring transactions</h3>
                                <p className="mt-1 text-xs text-[#829088]">
                                    Turn on "Recurring transaction" when adding one to see it here.
                                </p>
                                <button
                                    type="button"
                                    onClick={openAddForm}
                                    className={primaryBtn + " mx-auto mt-4"}
                                >
                                    <Plus size={16} />
                                    Add transaction
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#edf1ee]">
                                {rules.map((rule) => {
                                    const isIncome = rule.type === "income";
                                    const busy = togglingIds.has(rule.id);
                                    const Icon = isIncome
                                        ? ArrowDownLeft
                                        : rule.type === "transfer"
                                          ? ArrowLeftRight
                                          : (findCategory(rule.categoryLabel)?.icon ?? Tag);
                                    const startsLater = rule.startDate && rule.startDate > today();

                                    return (
                                        <div
                                            key={rule.id}
                                            className={
                                                "flex flex-col gap-3 px-4 py-4 transition-colors duration-200 sm:flex-row sm:items-center sm:px-5 " +
                                                (rule.isActive ? "hover:bg-[#fafcfb]" : "bg-[#f7f9f7]")
                                            }
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                <span
                                                    className={
                                                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-opacity duration-200 " +
                                                        (isIncome
                                                            ? "bg-[#eaf2ee] text-[#0f766e] "
                                                            : "bg-[#fbefeb] text-[#b4533c] ") +
                                                        (rule.isActive ? "" : "opacity-50")
                                                    }
                                                >
                                                    <Icon size={20} />
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p
                                                            className={
                                                                "truncate text-sm font-semibold " +
                                                                (rule.isActive ? "" : "text-[#5b6b65]")
                                                            }
                                                        >
                                                            {rule.description}
                                                        </p>

                                                        {rule.isActive ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf2ee] px-2 py-0.5 text-[11px] font-semibold text-[#0f766e]">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2ef] px-2 py-0.5 text-[11px] font-semibold text-[#5b6b65]">
                                                                <Pause size={11} />
                                                                Paused
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 truncate text-xs text-[#829088]">
                                                        {[
                                                            rule.frequency ? titleCase(rule.frequency) : "",
                                                            titleCase(rule.categoryLabel),
                                                            rule.accountLabel,
                                                            rule.paymentMethod,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </p>

                                                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5b6b65]">
                                                        <span className="inline-flex items-center gap-1">
                                                            <CalendarClock size={12} />
                                                            {rule.isActive
                                                                ? rule.nextRunAt
                                                                    ? `Next run ${formatShortDate(rule.nextRunAt)}`
                                                                    : "No upcoming run"
                                                                : "Paused, nothing will be added"}
                                                        </span>
                                                        {rule.startDate && (
                                                            <span>
                                                                {startsLater ? "Starts" : "Started"}{" "}
                                                                {formatShortDate(rule.startDate)}
                                                            </span>
                                                        )}
                                                        {rule.endDate && (
                                                            <span>Ends {formatShortDate(rule.endDate)}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                                                <p
                                                    className={`whitespace-nowrap text-sm font-semibold tabular-nums ${
                                                        isIncome ? "text-[#0f766e]" : "text-[#14201c]"
                                                    }`}
                                                >
                                                    {isIncome ? "+" : "−"}
                                                    {formatMoney(rule.amount)}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <span className="w-11 text-right text-xs font-semibold text-[#5b6b65]">
                                                        {rule.isActive ? "Active" : "Paused"}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={rule.isActive}
                                                        aria-label={`${rule.isActive ? "Pause" : "Resume"} ${rule.description}`}
                                                        disabled={busy}
                                                        onClick={() => handleToggleRule(rule)}
                                                        className={
                                                            "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 " +
                                                            (rule.isActive ? "bg-[#0f3d33] " : "bg-[#cfd9d3] ") +
                                                            focusRing
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                "absolute left-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-white shadow transition-transform duration-200 " +
                                                                (rule.isActive ? "translate-x-5" : "")
                                                            }
                                                        >
                                                            {busy && (
                                                                <Loader2
                                                                    size={12}
                                                                    className="animate-spin text-[#0f3d33]"
                                                                />
                                                            )}
                                                        </span>
                                                    </button>

                                                    <div className="ml-1 flex items-center gap-1 border-l border-[#e3eae6] pl-2">
                                                        {rule.type !== "transfer" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditRule(rule)}
                                                                aria-label={`Edit ${rule.description}`}
                                                                className={
                                                                    "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#5b6b65] transition-colors hover:bg-[#eaf2ee] hover:text-[#0f3d33] " +
                                                                    focusRing
                                                                }
                                                            >
                                                                <Pencil size={15} />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRuleRemoveError("");
                                                                setRuleRemoveTarget(rule);
                                                            }}
                                                            aria-label={`Delete ${rule.description}`}
                                                            className={
                                                                "grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#5b6b65] transition-colors hover:bg-[#fef3f2] hover:text-[#b42318] " +
                                                                focusRing
                                                            }
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Add / edit dialog */}
            {showForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#14201c]/45 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSaving) closeForm();
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="transaction-dialog-title"
                        className="max-h-[92vh] w-full max-w-2xl animate-[tx-pop_0.2s_ease-out_both] overflow-y-auto rounded-2xl border border-[#e3eae6] bg-white shadow-2xl motion-reduce:animate-none"
                    >
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#edf1ee] bg-white px-5 py-4 sm:px-6">
                            <div>
                                <h2
                                    id="transaction-dialog-title"
                                    className="font-['Unbounded',sans-serif] text-base font-semibold"
                                >
                                    {editingId ? "Edit transaction" : "Add transaction"}
                                </h2>
                                <p className="mt-1 text-sm text-[#829088]">
                                    Enter the transaction details below.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={isSaving}
                                aria-label="Close form"
                                className={
                                    "grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-[#e3eae6] text-[#5b6b65] transition-colors hover:bg-[#f3f6f2] disabled:cursor-not-allowed disabled:opacity-50 " +
                                    focusRing
                                }
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5 sm:p-6">
                            {/* Type */}
                            <div>
                                <span className={labelClass}>Transaction type</span>
                                <div role="radiogroup" aria-label="Transaction type" className="grid grid-cols-2 gap-3">
                                    {["expense", "income"].map((type) => {
                                        const selected = form.type === type;
                                        const TypeIcon = type === "income" ? ArrowDownLeft : ArrowUpRight;

                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                onClick={() => pickType(type)}
                                                className={
                                                    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] " +
                                                    (selected
                                                        ? type === "income"
                                                            ? "border-[#0f3d33] bg-[#eaf2ee] text-[#0f3d33] ring-4 ring-[#c9a227]/20 "
                                                            : "border-[#b4533c] bg-[#fbefeb] text-[#b4533c] ring-4 ring-[#b4533c]/10 "
                                                        : "border-[#cfd9d3] text-[#5b6b65] hover:border-[#0f3d33]/50 hover:bg-[#f7f9f7] ") +
                                                    focusRing
                                                }
                                            >
                                                <TypeIcon size={17} />
                                                {type === "income" ? "Income" : "Expense"}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className={form.isRecurring && !editingId ? "sm:col-span-2" : ""}>
                                    <label htmlFor="amount" className={labelClass}>
                                        Amount *
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5b6b65]">
                                            ₹
                                        </span>
                                        <input
                                            id="amount"
                                            autoFocus
                                            type="number"
                                            inputMode="decimal"
                                            min="0.01"
                                            step="0.01"
                                            name="amount"
                                            value={form.amount}
                                            onChange={updateField}
                                            placeholder="0.00"
                                            className={fieldClass + " pl-8 tabular-nums"}
                                        />
                                    </div>
                                </div>

                                {!(form.isRecurring && !editingId) && (
                                    <div>
                                        <label htmlFor="transactionDate" className={labelClass}>
                                            Transaction date *
                                        </label>
                                        <input
                                            id="transactionDate"
                                            type="date"
                                            name="transactionDate"
                                            max={today()}
                                            value={form.transactionDate}
                                            onChange={updateField}
                                            className={fieldClass}
                                        />
                                    </div>
                                )}

                                <div className="sm:col-span-2">
                                    <label htmlFor="description" className={labelClass}>
                                        Description *
                                    </label>
                                    <input
                                        id="description"
                                        maxLength={150}
                                        name="description"
                                        value={form.description}
                                        onChange={updateField}
                                        placeholder="e.g. Groceries, salary, electricity bill"
                                        className={fieldClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className={labelClass}>
                                        Category *
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category}
                                        onChange={updateField}
                                        className={fieldClass}
                                    >
                                        {CATEGORIES.map((item) => (
                                            <option key={item.name} value={item.name}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="paymentMethod" className={labelClass}>
                                        Payment method *
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={form.paymentMethod}
                                        onChange={pickMethod}
                                        className={fieldClass}
                                    >
                                        {PAYMENT_METHODS.map((method) => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    {needsAccount ? (
                                        <>
                                            <label htmlFor="accountId" className={labelClass}>
                                                Account *
                                            </label>
                                            <select
                                                id="accountId"
                                                name="accountId"
                                                value={form.accountId}
                                                onChange={updateField}
                                                disabled={noAccounts}
                                                className={fieldClass}
                                            >
                                                {noAccounts && <option value="">No accounts yet</option>}
                                                {accounts.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {noAccounts && (
                                                <p className="mt-1.5 text-xs text-[#829088]">
                                                    <Link
                                                        to="/dashboard"
                                                        className="font-semibold text-[#0f3d33] underline underline-offset-2"
                                                    >
                                                        Add an account
                                                    </Link>{" "}
                                                    first, or choose Cash.
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-start gap-3 rounded-xl bg-[#f3f6f2] p-3.5 text-xs leading-5 text-[#5b6b65]">
                                            <Banknote size={18} className="mt-0.5 shrink-0 text-[#0f3d33]" />
                                            <p>
                                                <strong className="text-[#14201c]">
                                                    {form.paymentMethod} payment.
                                                </strong>{" "}
                                                It isn't linked to any account, so no account balance changes.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recurring: only when creating */}
                            {!editingId ? (
                                <div className="rounded-xl border border-[#cfd9d3] p-4">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={form.isRecurring}
                                        onClick={() =>
                                            setForm((previous) => ({
                                                ...previous,
                                                isRecurring: !previous.isRecurring,
                                            }))
                                        }
                                        className={
                                            "flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg text-left " +
                                            focusRing
                                        }
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f8f0d8] text-[#8b6a12]">
                                                <Repeat2 size={19} />
                                            </span>
                                            <span>
                                                <span className="block text-sm font-semibold">
                                                    Recurring transaction
                                                </span>
                                                <span className="mt-0.5 block text-xs text-[#829088]">
                                                    Repeat this income or expense on a schedule.
                                                </span>
                                            </span>
                                        </span>

                                        <span
                                            aria-hidden="true"
                                            className={
                                                "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 " +
                                                (form.isRecurring ? "bg-[#0f3d33]" : "bg-[#cfd9d3]")
                                            }
                                        >
                                            <span
                                                className={
                                                    "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 " +
                                                    (form.isRecurring ? "translate-x-5" : "")
                                                }
                                            />
                                        </span>
                                    </button>

                                    {form.isRecurring && (
                                        <div className="mt-5 animate-[tx-pop_0.2s_ease-out_both] space-y-4 border-t border-[#edf1ee] pt-4 motion-reduce:animate-none">
                                            <div>
                                                <span className={labelClass}>Repeats</span>
                                                <Segmented
                                                    options={FREQUENCIES}
                                                    value={form.frequency}
                                                    onChange={(frequency) =>
                                                        setForm((previous) => ({ ...previous, frequency }))
                                                    }
                                                    label="Frequency"
                                                    size="sm"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label htmlFor="startDate" className={labelClass}>
                                                        Start date *
                                                    </label>
                                                    <input
                                                        id="startDate"
                                                        type="date"
                                                        name="startDate"
                                                        value={form.startDate}
                                                        onChange={updateField}
                                                        className={fieldClass}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="endDate" className={labelClass}>
                                                        End date (optional)
                                                    </label>
                                                    <input
                                                        id="endDate"
                                                        type="date"
                                                        name="endDate"
                                                        min={form.startDate || undefined}
                                                        value={form.endDate}
                                                        onChange={updateField}
                                                        className={fieldClass}
                                                    />
                                                </div>
                                            </div>

                                            {schedule && (
                                                <div className="flex gap-3 rounded-xl bg-[#f3f6f2] p-3.5 text-xs leading-5 text-[#5b6b65]">
                                                    <CalendarClock size={18} className="mt-0.5 shrink-0 text-[#0f3d33]" />
                                                    <div className="space-y-1">
                                                        <p>
                                                            <strong className="text-[#14201c]">First entry: </strong>
                                                            {schedule.startsNow
                                                                ? "recorded as soon as you save."
                                                                : `nothing is added until ${formatShortDate(form.startDate)}.`}
                                                        </p>
                                                        <p>
                                                            <strong className="text-[#14201c]">Next run: </strong>
                                                            {schedule.next
                                                                ? formatShortDate(schedule.next)
                                                                : "none, the next date falls after the end date."}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                editingRecurring && (
                                    <p className="flex items-start gap-2 rounded-xl bg-[#f8f0d8] px-4 py-3 text-xs leading-5 text-[#8b6a12]">
                                        <Repeat2 size={15} className="mt-0.5 shrink-0" />
                                        This entry belongs to a recurring series. Your changes apply to this
                                        transaction only.
                                    </p>
                                )
                            )}

                            {formError && (
                                <p
                                    role="alert"
                                    className="rounded-xl bg-[#fef3f2] px-4 py-3 text-sm font-medium text-[#b42318]"
                                >
                                    {formError}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t border-[#edf1ee] pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={isSaving}
                                    className={ghostBtn + " justify-center"}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || (needsAccount && noAccounts)}
                                    className={primaryBtn + " justify-center"}
                                >
                                    {isSaving ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Check size={16} />
                                    )}
                                    {isSaving
                                        ? "Saving..."
                                        : editingId
                                          ? "Save changes"
                                          : form.isRecurring
                                            ? "Save recurring"
                                            : "Save transaction"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* Delete confirmation */}
            {removeTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#14201c]/45 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isRemoving) setRemoveTarget(null);
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                        aria-describedby="delete-desc"
                        className="w-full max-w-sm animate-[tx-pop_0.2s_ease-out_both] rounded-2xl border border-[#e3eae6] bg-white p-6 shadow-2xl motion-reduce:animate-none"
                    >
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fef3f2] text-[#b42318]">
                            <Trash2 size={22} />
                        </span>

                        <h2
                            id="delete-title"
                            className="mt-4 font-['Unbounded',sans-serif] text-base font-semibold"
                        >
                            Delete this transaction?
                        </h2>
                        <p id="delete-desc" className="mt-2 text-sm text-[#5b6b65]">
                            "{removeTarget.description}" for {formatMoney(removeTarget.amount)} will be
                            removed from your records.
                        </p>

                        {removeError && (
                            <p
                                role="alert"
                                className="mt-3 rounded-lg bg-[#fef3f2] px-3 py-2 text-sm font-medium text-[#b42318]"
                            >
                                {removeError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => setRemoveTarget(null)}
                                disabled={isRemoving}
                                className={ghostBtn}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmRemove}
                                disabled={isRemoving}
                                className={
                                    "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#b42318] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#912018] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 " +
                                    focusRing
                                }
                            >
                                {isRemoving && <Loader2 size={16} className="animate-spin" />}
                                {isRemoving ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit recurring transaction */}
            {editingRule && ruleForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#14201c]/45 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSavingRule) closeEditRule();
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rule-dialog-title"
                        className="max-h-[92vh] w-full max-w-2xl animate-[tx-pop_0.2s_ease-out_both] overflow-y-auto rounded-2xl border border-[#e3eae6] bg-white shadow-2xl motion-reduce:animate-none"
                    >
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#edf1ee] bg-white px-5 py-4 sm:px-6">
                            <div>
                                <h2
                                    id="rule-dialog-title"
                                    className="font-['Unbounded',sans-serif] text-base font-semibold"
                                >
                                    Edit recurring transaction
                                </h2>
                                <p className="mt-1 text-sm text-[#829088]">
                                    Changes apply to entries created from now on.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEditRule}
                                disabled={isSavingRule}
                                aria-label="Close form"
                                className={
                                    "grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-[#e3eae6] text-[#5b6b65] transition-colors hover:bg-[#f3f6f2] disabled:cursor-not-allowed disabled:opacity-50 " +
                                    focusRing
                                }
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <form onSubmit={handleRuleSubmit} noValidate className="space-y-5 p-5 sm:p-6">
                            <div>
                                <span className={labelClass}>Transaction type</span>
                                <TypeToggle
                                    value={ruleForm.type}
                                    onChange={(type) => setRuleForm((previous) => ({ ...previous, type }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="ruleAmount" className={labelClass}>
                                        Amount *
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5b6b65]">
                                            ₹
                                        </span>
                                        <input
                                            id="ruleAmount"
                                            autoFocus
                                            type="number"
                                            inputMode="decimal"
                                            min="0.01"
                                            step="0.01"
                                            name="amount"
                                            value={ruleForm.amount}
                                            onChange={updateRuleField}
                                            placeholder="0.00"
                                            className={fieldClass + " pl-8 tabular-nums"}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="ruleDescription" className={labelClass}>
                                        Description *
                                    </label>
                                    <input
                                        id="ruleDescription"
                                        maxLength={150}
                                        name="description"
                                        value={ruleForm.description}
                                        onChange={updateRuleField}
                                        className={fieldClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="ruleCategory" className={labelClass}>
                                        Category *
                                    </label>
                                    <select
                                        id="ruleCategory"
                                        name="category"
                                        value={ruleForm.category}
                                        onChange={updateRuleField}
                                        className={fieldClass}
                                    >
                                        {CATEGORIES.map((item) => (
                                            <option key={item.name} value={item.name}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="rulePaymentMethod" className={labelClass}>
                                        Payment method *
                                    </label>
                                    <select
                                        id="rulePaymentMethod"
                                        name="paymentMethod"
                                        value={ruleForm.paymentMethod}
                                        onChange={pickRuleMethod}
                                        className={fieldClass}
                                    >
                                        {PAYMENT_METHODS.map((method) => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    {ruleNeedsAccount ? (
                                        <>
                                            <label htmlFor="ruleAccount" className={labelClass}>
                                                Account *
                                            </label>
                                            <select
                                                id="ruleAccount"
                                                name="accountId"
                                                value={ruleForm.accountId}
                                                onChange={updateRuleField}
                                                disabled={noAccounts}
                                                className={fieldClass}
                                            >
                                                {noAccounts && <option value="">No accounts yet</option>}
                                                {accounts.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <div className="flex items-start gap-3 rounded-xl bg-[#f3f6f2] p-3.5 text-xs leading-5 text-[#5b6b65]">
                                            <Banknote size={18} className="mt-0.5 shrink-0 text-[#0f3d33]" />
                                            <p>
                                                <strong className="text-[#14201c]">
                                                    {ruleForm.paymentMethod} payment.
                                                </strong>{" "}
                                                It isn't linked to any account, so no account balance changes.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="space-y-4 rounded-xl border border-[#cfd9d3] p-4">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f8f0d8] text-[#8b6a12]">
                                        <Repeat2 size={19} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold">Schedule</p>
                                        <p className="mt-0.5 text-xs text-[#829088]">
                                            How often this repeats and when it stops.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <span className={labelClass}>Repeats</span>
                                    <Segmented
                                        options={FREQUENCIES}
                                        value={ruleForm.frequency}
                                        onChange={(frequency) =>
                                            setRuleForm((previous) => ({ ...previous, frequency }))
                                        }
                                        label="Frequency"
                                        size="sm"
                                        className="w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="ruleStartDate" className={labelClass}>
                                            Start date
                                        </label>
                                        <input
                                            id="ruleStartDate"
                                            type="date"
                                            name="startDate"
                                            value={ruleForm.startDate}
                                            onChange={updateRuleField}
                                            disabled={ruleStartLocked}
                                            className={fieldClass}
                                        />
                                        {ruleStartLocked && (
                                            <p className="mt-1.5 text-xs text-[#829088]">
                                                Can't change once the rule has started.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="ruleEndDate" className={labelClass}>
                                            End date (optional)
                                        </label>
                                        <input
                                            id="ruleEndDate"
                                            type="date"
                                            name="endDate"
                                            min={ruleForm.startDate || undefined}
                                            value={ruleForm.endDate}
                                            onChange={updateRuleField}
                                            className={fieldClass}
                                        />
                                        {ruleForm.endDate && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setRuleForm((previous) => ({ ...previous, endDate: "" }))
                                                }
                                                className={
                                                    "mt-1.5 cursor-pointer rounded text-xs font-semibold text-[#0f3d33] underline underline-offset-2 " +
                                                    focusRing
                                                }
                                            >
                                                Remove end date
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {rulePreview && (
                                    <div className="flex gap-3 rounded-xl bg-[#f3f6f2] p-3.5 text-xs leading-5 text-[#5b6b65]">
                                        <CalendarClock size={18} className="mt-0.5 shrink-0 text-[#0f3d33]" />
                                        <div className="space-y-1">
                                            <p>
                                                <strong className="text-[#14201c]">First entry: </strong>
                                                {rulePreview.startsNow
                                                    ? "recorded as soon as you save."
                                                    : `nothing is added until ${formatShortDate(ruleForm.startDate)}.`}
                                            </p>
                                            <p>
                                                <strong className="text-[#14201c]">Next run: </strong>
                                                {rulePreview.next
                                                    ? formatShortDate(rulePreview.next)
                                                    : "none, the next date falls after the end date."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {ruleError && (
                                <p
                                    role="alert"
                                    className="rounded-xl bg-[#fef3f2] px-4 py-3 text-sm font-medium text-[#b42318]"
                                >
                                    {ruleError}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t border-[#edf1ee] pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeEditRule}
                                    disabled={isSavingRule}
                                    className={ghostBtn + " justify-center"}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingRule || (ruleNeedsAccount && noAccounts)}
                                    className={primaryBtn + " justify-center"}
                                >
                                    {isSavingRule ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Check size={16} />
                                    )}
                                    {isSavingRule ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* Delete recurring transaction */}
            {ruleRemoveTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#14201c]/45 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isRemovingRule)
                            setRuleRemoveTarget(null);
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="rule-delete-title"
                        aria-describedby="rule-delete-desc"
                        className="w-full max-w-sm animate-[tx-pop_0.2s_ease-out_both] rounded-2xl border border-[#e3eae6] bg-white p-6 shadow-2xl motion-reduce:animate-none"
                    >
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fef3f2] text-[#b42318]">
                            <Trash2 size={22} />
                        </span>

                        <h2
                            id="rule-delete-title"
                            className="mt-4 font-['Unbounded',sans-serif] text-base font-semibold"
                        >
                            Delete this recurring transaction?
                        </h2>
                        <p id="rule-delete-desc" className="mt-2 text-sm text-[#5b6b65]">
                            "{ruleRemoveTarget.description}" will stop repeating
                            {removeRuleEntries > 0
                                ? ` and the ${removeRuleEntries} ${
                                      removeRuleEntries === 1 ? "transaction" : "transactions"
                                  } created from it will also be deleted.`
                                : "."}{" "}
                            This can't be undone.
                        </p>

                        {ruleRemoveError && (
                            <p
                                role="alert"
                                className="mt-3 rounded-lg bg-[#fef3f2] px-3 py-2 text-sm font-medium text-[#b42318]"
                            >
                                {ruleRemoveError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => setRuleRemoveTarget(null)}
                                disabled={isRemovingRule}
                                className={ghostBtn}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmRemoveRule}
                                disabled={isRemovingRule}
                                className={
                                    "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#b42318] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#912018] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 " +
                                    focusRing
                                }
                            >
                                {isRemovingRule && <Loader2 size={16} className="animate-spin" />}
                                {isRemovingRule ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;