import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig.jsx";
import { focusRing } from "../utils/styleClass.jsx";
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    Banknote,
    Check,
    CircleDollarSign,
    CreditCard,
    Film,
    Landmark,
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    Receipt,
    Search,
    ShoppingBag,
    Trash2,
    TrendingDown,
    TrendingUp,
    Utensils,
    Wallet,
    X,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth.jsx";
import { useAccount } from "../hooks/useAccount.jsx";
import { useNotification } from "../hooks/useNotification.jsx";
import { useTransaction } from "../hooks/useTransaction.jsx";

const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const normalizeAccount = (account) => ({
    id: account._id ?? account.id,
    name: account.name ?? "",
    type: account.type ?? "Bank",
    balance: Number(account.balance ?? 0),
    color: account.color,
});

const ACCOUNT_TYPES = [
    { value: "Bank", label: "Bank account", icon: Landmark, color: "#0f3d33" },
    { value: "Cash", label: "Cash", icon: Banknote, color: "#a17b17" },
    {
        value: "Digital Wallet",
        label: "Digital wallet",
        icon: Wallet,
        color: "#4766a8",
    },
    {
        value: "Credit Card",
        label: "Credit card",
        icon: CreditCard,
        color: "#8a4b6d",
    },
];

const getAccountMeta = (type) =>
    ACCOUNT_TYPES.find((item) => item.value === type) ?? ACCOUNT_TYPES[2];

const DEMO_TRANSACTIONS = [
    {
        id: "t1",
        description: "Monthly stipend",
        category: "Income",
        type: "income",
        amount: 15000,
        account: "Savings Account",
        transactionDate: "2026-10-18T09:30:00",
    },
    {
        id: "t2",
        description: "Groceries",
        category: "Food",
        type: "expense",
        amount: 1250,
        account: "Cash Wallet",
        transactionDate: "2026-10-17T18:15:00",
    },
    {
        id: "t3",
        description: "Freelance work",
        category: "Income",
        type: "income",
        amount: 5000,
        account: "UPI Account",
        transactionDate: "2026-10-16T13:00:00",
    },
    {
        id: "t4",
        description: "Movie and dinner",
        category: "Entertainment",
        type: "expense",
        amount: 850,
        account: "UPI Account",
        transactionDate: "2026-10-15T20:00:00",
    },
    {
        id: "t5",
        description: "Internet bill",
        category: "Bills",
        type: "expense",
        amount: 799,
        account: "Savings Account",
        transactionDate: "2026-10-14T11:00:00",
    },
];

const getTransactionIcon = (category, type) => {
    if (type === "income") return ArrowDownLeft;
    if (category === "Food") return Utensils;
    if (category === "Shopping") return ShoppingBag;
    if (category === "Entertainment") return Film;
    if (category === "Bills") return Receipt;
    return ArrowUpRight;
};

// "Today", "Yesterday", otherwise "17 Oct"
const formatDate = (value) => {
    const date = new Date(value);
    const startOfDay = (d) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = Math.round(
        (startOfDay(new Date()) - startOfDay(date)) / 86400000,
    );

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";

    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const PERIODS = [
    { key: "week", label: "7 days", phrase: "in the last 7 days" },
    { key: "month", label: "This month", phrase: "this month" },
    { key: "all", label: "All time", phrase: "across all time" },
];

const TX_FILTERS = [
    { key: "all", label: "All" },
    { key: "income", label: "Income" },
    { key: "expense", label: "Expenses" },
];

const useCountUp = (target, duration = 700) => {
    const [value, setValue] = useState(0);
    const previous = useRef(0);

    useEffect(() => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setValue(target);
            previous.current = target;
            return;
        }

        const from = previous.current;
        const start = performance.now();
        let frame;

        const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(from + (target - from) * eased);

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            } else {
                previous.current = target;
            }
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return Math.round(value);
};

/* Small pill-style switcher used for period and transaction filters */
const Segmented = ({ options, value, onChange, label, size = "md" }) => (
    <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-xl border border-[#cfd9d3] bg-white p-1"
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
                        "cursor-pointer rounded-lg font-semibold transition-all duration-200 " +
                        (size === "sm"
                            ? "px-3 py-1 text-xs "
                            : "px-3.5 py-1.5 text-sm ") +
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

const SummaryCard = ({
    label,
    amount,
    description,
    icon: Icon,
    variant = "light",
    negative = false,
}) => {
    const dark = variant === "dark";
    const shown = useCountUp(amount);

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 ${
                dark
                    ? "border-[#0f3d33] bg-[#0f3d33] text-white shadow-[0_18px_32px_-20px_rgba(15,61,51,0.9)]"
                    : "border-[#e3eae6] bg-white text-[#14201c] hover:border-[#cfd9d3] hover:shadow-[0_14px_28px_-20px_rgba(15,61,51,0.5)]"
            }`}
        >
            {dark && (
                <>
                    <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#c9a227]/20" />
                    <div className="pointer-events-none absolute -bottom-16 right-14 h-28 w-28 rounded-full bg-white/5" />
                    <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(255,255,255,0.05)_31px,rgba(255,255,255,0.05)_32px)]" />
                </>
            )}

            <div className="relative flex items-center justify-between gap-3">
                <p
                    className={`text-sm ${dark ? "text-white/70" : "text-[#5b6b65]"}`}
                >
                    {label}
                </p>

                <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        dark
                            ? "bg-white/10 text-[#e5cb72]"
                            : "bg-[#f3f6f2] text-[#0f3d33]"
                    }`}
                >
                    <Icon size={19} />
                </span>
            </div>

            <p
                className={`relative mt-5 wrap-break-words text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl ${
                    negative ? "text-[#b42318]" : ""
                }`}
            >
                {currency(shown)}
            </p>

            <p
                className={`relative mt-2 text-xs ${dark ? "text-white/65" : "text-[#829088]"}`}
            >
                {description}
            </p>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const {transactions:all_transactions} = useTransaction();
    const { Accounts,addAccount,editAccount,removeAccount } = useAccount();
    const { addNotifications } = useNotification();
    const navigate = useNavigate();
    // Accounts come straight from the context so they stay in sync with the backend.
    // (Copying them into useState would freeze the first value and miss later updates.)
    const isLoadingAccounts = Accounts == null;
    const accounts = useMemo(
        () => (Accounts ?? []).map(normalizeAccount),
        [Accounts],
    );

    // TODO: replace with your transactions hook
    const transactions = all_transactions;

    const [period, setPeriod] = useState("month");
    const [txFilter, setTxFilter] = useState("all");
    const [transactionSearch, setTransactionSearch] = useState("");

    const [accountModal, setAccountModal] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [accountMenuId, setAccountMenuId] = useState(null);
    const [accountForm, setAccountForm] = useState({
        name: "",
        type: "Bank",
        balance: "",
    });
    const [accountError, setAccountError] = useState("");
    const [isSavingAccount, setIsSavingAccount] = useState(false);

    const [removeTarget, setRemoveTarget] = useState(null);
    const [removeError, setRemoveError] = useState("");
    const [isRemoving, setIsRemoving] = useState(false);

    // Lets the account share bars grow from 0 on first paint
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const handleSaveAccount = async ({ id, name, type, balance }) => {
        //? managing updation and creation of the account
        
        if (id) {
            const response = await editAccount(id, { name, type, balance });
            if (response.success) {
                await addNotifications({
                    type: "Account-Page",
                    title: "Edit Account Details",
                    message: `Successfully updated your account:- ${name}`,
                });
                toast.success("Account updated successfully !!", toastConfig);
            }else{
                toast.error(`${response.message || "error in updating account details"}`, toastConfig);
            }
        }else {
            const response = await addAccount({ name, type, balance });
            if (response.success) {
                await addNotifications({
                    type: "Account-Page",
                    title: "Add Account",
                    message: `Successfully added your account:- ${name} with current balance:- ${balance}`,
                });
                toast.success("Account added successfully !!", toastConfig);
            }else{
                toast.error(`${response.message || "error in creating account"}`, toastConfig);
            }
        }
    };

    const handleRemoveAccount = async ({id,name}) => {
        const response = await removeAccount(id);
        if(response.success){
            await addNotifications({
                type:"Account-Page",
                title:"Delete Account",
                message:`Your ${name} account was Deleted successfully !!`
            })
            toast.success(`Account Deleted successfully !!`, toastConfig);
        }else{
            toast.success("error in deleting account !!", toastConfig);
        }
    };

    const periodPhrase =
        PERIODS.find((item) => item.key === period)?.phrase ?? "";

    const filteredTransactions = useMemo(() => {
        if (period === "all") return transactions;

        const now = new Date();

        return transactions.filter((transaction) => {
            const date = new Date(transaction.transactionDate);

            if (period === "week") {
                const start = new Date(now);
                start.setDate(now.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                return date >= start && date <= now;
            }

            return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth()
            );
        });
    }, [transactions, period]);

    const summary = useMemo(() => {
        const income = filteredTransactions
            .filter((item) => item.type === "income")
            .reduce((total, item) => total + item.amount, 0);

        const expenses = filteredTransactions
            .filter((item) => item.type === "expense")
            .reduce((total, item) => total + item.amount, 0);

        return { income, expenses, net: income - expenses };
    }, [filteredTransactions]);

    const totalBalance = accounts.reduce(
        (total, account) => total + account.balance,
        0,
    );

    const recentTransactions = useMemo(() => {
        const term = transactionSearch.trim().toLowerCase();

        return [...filteredTransactions]
            .filter((item) => txFilter === "all" || item.type === txFilter)
            .filter(
                (item) =>
                    !term ||
                    item.description.toLowerCase().includes(term) ||
                    item.category.toLowerCase().includes(term),
            )
            .sort(
                (a, b) =>
                    new Date(b.transactionDate) - new Date(a.transactionDate),
            )
            .slice(0, 5);
    }, [filteredTransactions, txFilter, transactionSearch]);

    /* Close the account menu on outside click / Escape */
    useEffect(() => {
        if (!accountMenuId) return;

        const onMouseDown = (e) => {
            if (!e.target.closest?.("[data-account-menu]"))
                setAccountMenuId(null);
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") setAccountMenuId(null);
        };

        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [accountMenuId]);

    /* Escape closes dialogs, and the page behind them stops scrolling */
    const dialogOpen = accountModal || !!removeTarget;
    useEffect(() => {
        if (!dialogOpen) return;

        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;

            if (removeTarget) {
                if (!isRemoving) setRemoveTarget(null);
            } else if (!isSavingAccount) {
                setAccountModal(false);
                setEditingAccountId(null);
                setAccountError("");
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [dialogOpen, removeTarget, isRemoving, isSavingAccount]);

    const openAddAccount = () => {
        setEditingAccountId(null);
        setAccountForm({ name: "", type: "Bank", balance: "" });
        setAccountError("");
        setAccountModal(true);
    };

    const openEditAccount = (account) => {
        setEditingAccountId(account.id);
        setAccountForm({
            name: account.name,
            type: account.type,
            balance: Number(account.balance),
        });
        setAccountError("");
        setAccountMenuId(null);
        setAccountModal(true);
    };

    const closeAccountModal = () => {
        setAccountModal(false);
        setEditingAccountId(null);
        setAccountError("");
    };

    const handleAccountSubmit = async (e) => {
        e.preventDefault();

        const name = accountForm.name.trim();
        const balance = Number(accountForm.balance);

        if (!name) {
            setAccountError("Please enter an account name.");
            return;
        }

        if (
            !Number.isFinite(balance) ||
            balance < 0
        ) {
            setAccountError("Enter a valid non-negative balance.");
            return;
        }

        const duplicate = accounts.some(
            (account) =>
                account.name.toLowerCase() === name.toLowerCase() &&
                account.id !== editingAccountId,
        );

        if (duplicate) {
            setAccountError("An account with this name already exists.");
            return;
        }

        try {
            setIsSavingAccount(true);
            setAccountError("");

            await handleSaveAccount({
                id: editingAccountId,
                name,
                type: accountForm.type,
                balance,
            });

            closeAccountModal();
        } catch (error) {
            setAccountError(
                error?.response?.data?.message ||
                    error?.message ||
                    "Could not save the account.",
            );
        } finally {
            setIsSavingAccount(false);
        }
    };

    const confirmRemove = async (e) => {
        if (!removeTarget) return;
        try {
            setIsRemoving(true);
            setRemoveError("");

            await handleRemoveAccount(removeTarget);

            setRemoveTarget(null);
        } catch (error) {
            setRemoveError(
                error?.response?.data?.message ||
                    error?.message ||
                    "Could not remove the account.",
            );
        } finally {
            setIsRemoving(false);
        }
    };

    const greeting = (() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    })();

    const rise = (delay = 0) => ({ animationDelay: `${delay}ms` });
    const riseClass =
        "animate-[db-rise_0.5s_ease-out_both] motion-reduce:animate-none";

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-10 font-['Figtree',system-ui,sans-serif] text-[#14201c]">
            <style>{`
                @keyframes db-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
                @keyframes db-pop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
            `}</style>

            {/* Heading and quick actions */}
            <section
                style={rise(0)}
                className={`flex flex-col justify-between gap-5 sm:flex-row sm:items-center ${riseClass}`}
            >
                <div className="flex items-center gap-3">
                    <span
                        className="h-14 w-1.5 shrink-0 rounded-full bg-[#0f3d33]"
                        aria-hidden="true"
                    />
                    <div>
                        <p className="text-sm font-medium text-[#5b6b65]">
                            Your money, in perspective
                        </p>

                        <h1 className="mt-1 font-['Unbounded',sans-serif] text-xl font-semibold tracking-tight sm:text-2xl">
                            {greeting}
                            {user?.fullname
                                ? `, ${user.fullname.split(" ")[0]}`
                                : ""}
                            .
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate("/transactions")}
                        className={
                            "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#cfd9d3] bg-white px-4 py-2.5 text-sm font-semibold text-[#14201c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f3d33] hover:bg-[#eaf2ee] active:scale-95 " +
                            focusRing
                        }
                    >
                        <ArrowLeftRight size={16} />
                        Transactions
                    </button>

                    <button
                        type="button"
                        onClick={openAddAccount}
                        className={
                            "group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f3d33] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(15,61,51,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b2e26] active:translate-y-0 active:scale-95 " +
                            focusRing
                        }
                    >
                        <Plus
                            size={17}
                            className="transition-transform duration-200 group-hover:rotate-90"
                        />
                        Add account
                    </button>
                </div>
            </section>

            {/* Period filter */}
            <section
                style={rise(60)}
                className={`flex flex-wrap items-center justify-between gap-3 ${riseClass}`}
            >
                <div>
                    <h2 className="font-['Unbounded',sans-serif] text-sm font-semibold">
                        Financial overview
                    </h2>
                    <p className="mt-1 text-xs text-[#829088]">
                        A snapshot of your money.
                    </p>
                </div>

                <Segmented
                    options={PERIODS}
                    value={period}
                    onChange={setPeriod}
                    label="Summary period"
                />
            </section>

            {/* Summary cards */}
            <section
                style={rise(120)}
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ${riseClass}`}
            >
                <SummaryCard
                    label="Total balance"
                    amount={totalBalance}
                    description={
                        isLoadingAccounts
                            ? "Loading accounts..."
                            : `Across ${accounts.length} ${accounts.length === 1 ? "account" : "accounts"}`
                    }
                    icon={Wallet}
                    variant="dark"
                />

                <SummaryCard
                    label="Total income"
                    amount={summary.income}
                    description={`Money received ${periodPhrase}`}
                    icon={TrendingUp}
                />

                <SummaryCard
                    label="Total expenses"
                    amount={summary.expenses}
                    description={`Money spent ${periodPhrase}`}
                    icon={TrendingDown}
                />

                <SummaryCard
                    label="Net cash flow"
                    amount={summary.net}
                    negative={summary.net < 0}
                    description={
                        summary.net < 0
                            ? "Spending is higher than income"
                            : "Income minus expenses"
                    }
                    icon={CircleDollarSign}
                />
            </section>

            {/* Accounts + transactions */}
            <section
                style={rise(180)}
                className={`grid grid-cols-1 items-start gap-6 xl:grid-cols-[0.85fr_1.5fr] ${riseClass}`}
            >
                {/* Accounts panel */}
                <div className="min-w-0 overflow-auto scrollbar-none max-h-[568.78px] rounded-2xl border border-[#e3eae6] bg-white">
                    <div className="flex items-start justify-between gap-3 border-b border-[#edf1ee] p-5">
                        <div>
                            <h2 className="font-['Unbounded',sans-serif] text-sm font-semibold">
                                My accounts
                            </h2>
                            <p className="mt-1 text-xs text-[#829088]">
                                Your money, organized.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openAddAccount}
                            aria-label="Add account"
                            className={
                                "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl border border-[#cfd9d3] text-[#0f3d33] transition-all duration-200 hover:border-[#0f3d33] hover:bg-[#eaf2ee] active:scale-95 " +
                                focusRing
                            }
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="space-y-1 p-3">
                        {/* Loading skeleton */}
                        {isLoadingAccounts &&
                            [0, 1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="flex animate-pulse items-center gap-3 p-3"
                                >
                                    <span className="h-11 w-11 rounded-xl bg-[#eef2ef]" />
                                    <div className="flex-1 space-y-2">
                                        <span className="block h-3 w-1/2 rounded bg-[#eef2ef]" />
                                        <span className="block h-2.5 w-1/4 rounded bg-[#f3f6f2]" />
                                    </div>
                                    <span className="h-3 w-16 rounded bg-[#eef2ef]" />
                                </div>
                            ))}

                        {/* Empty state */}
                        {!isLoadingAccounts && accounts.length === 0 && (
                            <div className="px-3 py-10 text-center">
                                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf2ee] text-[#0f3d33]">
                                    <Wallet size={26} />
                                </span>
                                <p className="mt-4 text-sm font-semibold">
                                    No accounts yet
                                </p>
                                <p className="mt-1 text-xs text-[#829088]">
                                    Add your bank, cash or wallet to start
                                    tracking.
                                </p>
                                <button
                                    type="button"
                                    onClick={openAddAccount}
                                    className={
                                        "mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0f3d33] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0b2e26] active:scale-95 " +
                                        focusRing
                                    }
                                >
                                    <Plus size={16} />
                                    Add your first account
                                </button>
                            </div>
                        )}

                        {accounts.map((account) => {
                            const meta = getAccountMeta(account.type);
                            const Icon = meta.icon;
                            const color = account.color || meta.color;
                            const share =
                                totalBalance > 0
                                    ? Math.min(
                                          100,
                                          (account.balance / totalBalance) *
                                              100,
                                      )
                                    : 0;

                            return (
                                <div
                                    key={account.id}
                                    className="group rounded-xl p-3 transition-colors duration-200 hover:bg-[#f7f9f7]"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                                            style={{
                                                backgroundColor: `${color}1a`,
                                                color,
                                            }}
                                        >
                                            <Icon size={20} />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                {account.name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#829088]">
                                                {account.type}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold tabular-nums">
                                                {currency(account.balance)}
                                            </p>
                                            <p className="mt-1 text-[10px] text-[#829088]">
                                                {Math.round(share)}% of total
                                            </p>
                                        </div>

                                        <div
                                            className="relative"
                                            data-account-menu
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAccountMenuId(
                                                        (current) =>
                                                            current ===
                                                            account.id
                                                                ? null
                                                                : account.id,
                                                    )
                                                }
                                                aria-haspopup="menu"
                                                aria-expanded={
                                                    accountMenuId === account.id
                                                }
                                                aria-label={`Manage ${account.name}`}
                                                className={
                                                    "grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-[#829088] transition hover:bg-white hover:text-[#0f3d33] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 " +
                                                    (accountMenuId ===
                                                    account.id
                                                        ? "sm:opacity-100 "
                                                        : "") +
                                                    focusRing
                                                }
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {accountMenuId === account.id && (
                                                <div
                                                    role="menu"
                                                    className="absolute right-0 top-9 z-20 w-44 animate-[db-pop_0.15s_ease-out_both] rounded-xl border border-[#e3eae6] bg-white p-1 shadow-[0_16px_32px_-12px_rgba(15,61,51,0.35)] motion-reduce:animate-none"
                                                >
                                                    <button
                                                        type="button"
                                                        role="menuitem"
                                                        onClick={() =>
                                                            openEditAccount(
                                                                account,
                                                            )
                                                        }
                                                        className={
                                                            "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-[#eaf2ee] " +
                                                            focusRing
                                                        }
                                                    >
                                                        <Pencil
                                                            size={14}
                                                            className="text-[#0f3d33]"
                                                        />
                                                        Edit account
                                                    </button>
                                                    <button
                                                        type="button"
                                                        role="menuitem"
                                                        onClick={() => {
                                                            setAccountMenuId(
                                                                null,
                                                            );
                                                            setRemoveError("");
                                                            setRemoveTarget(
                                                                account,
                                                            );
                                                        }}
                                                        className={
                                                            "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#b42318] transition-colors hover:bg-[#fef3f2] " +
                                                            focusRing
                                                        }
                                                    >
                                                        <Trash2 size={14} />
                                                        Remove account
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Share of total balance */}
                                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#eef2ef]">
                                        <div
                                            className="h-full rounded-full transition-[width] duration-700 ease-out"
                                            style={{
                                                width: mounted
                                                    ? `${share}%`
                                                    : "0%",
                                                backgroundColor: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {accounts.length > 0 && (
                        <div className="border-t border-[#edf1ee] p-4">
                            <button
                                type="button"
                                onClick={openAddAccount}
                                className={
                                    "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#0f3d33]/40 py-3 text-sm font-semibold text-[#0f3d33] transition-all duration-200 hover:border-solid hover:border-[#0f3d33] hover:bg-[#eaf2ee] active:scale-[0.99] " +
                                    focusRing
                                }
                            >
                                <Plus size={16} />
                                Add another account
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent transactions panel */}
                <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e3eae6] bg-white">
                    <div className="flex flex-col justify-between gap-3 border-b border-[#edf1ee] p-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-['Unbounded',sans-serif] text-sm font-semibold">
                                Recent transactions
                            </h2>
                            <p className="mt-1 text-xs text-[#829088]">
                                Keep track of where your money goes.
                            </p>
                        </div>

                        <Link
                            to="/transactions"
                            className={
                                "group inline-flex items-center gap-1 text-sm font-semibold text-[#0f3d33] transition-colors hover:text-[#a17b17] " +
                                focusRing
                            }
                        >
                            View all
                            <ArrowUpRight
                                size={15}
                                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </Link>
                    </div>

                    {/* Search and filter */}
                    <div className="flex flex-col gap-3 border-b border-[#edf1ee] px-5 py-3 sm:flex-row sm:items-center">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-transparent bg-[#f3f6f2] px-3 py-2 transition-all duration-200 focus-within:border-[#0f3d33] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#c9a227]/20">
                            <Search
                                size={15}
                                className="shrink-0 text-[#829088]"
                            />
                            <input
                                type="text"
                                placeholder="Search recent transactions..."
                                value={transactionSearch}
                                onChange={(e) =>
                                    setTransactionSearch(e.target.value)
                                }
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#829088]"
                                aria-label="Search transactions"
                            />
                            {transactionSearch && (
                                <button
                                    type="button"
                                    onClick={() => setTransactionSearch("")}
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

                        <Segmented
                            options={TX_FILTERS}
                            value={txFilter}
                            onChange={setTxFilter}
                            label="Transaction type"
                            size="sm"
                        />
                    </div>

                    <div className="divide-y divide-[#edf1ee]">
                        {recentTransactions.length === 0 && (
                            <div className="p-10 text-center">
                                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f3f6f2] text-[#829088]">
                                    <ArrowLeftRight size={26} />
                                </span>
                                <p className="mt-4 text-sm font-semibold">
                                    {transactionSearch || txFilter !== "all"
                                        ? "No matching transactions"
                                        : "No transactions yet"}
                                </p>
                                <p className="mt-1 text-xs text-[#829088]">
                                    {transactionSearch || txFilter !== "all"
                                        ? "Try a different search or filter."
                                        : "Your activity will appear here."}
                                </p>
                            </div>
                        )}

                        {recentTransactions.map((transaction) => {
                            const isIncome = transaction.type === "income";
                            const Icon = getTransactionIcon(
                                transaction.category,
                                transaction.type,
                            );

                            return (
                                <div
                                    key={transaction._id}
                                    className="group flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-[#fafcfb]"
                                >
                                    <span
                                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
                                            isIncome
                                                ? "bg-[#eaf2ee] text-[#0f766e]"
                                                : "bg-[#fbefeb] text-[#b4533c]"
                                        }`}
                                    >
                                        <Icon size={19} />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {transaction.description}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-[#829088]">
                                            {transaction.category}
                                            {" · "}
                                            {transaction.account}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p
                                            className={`text-sm font-semibold tabular-nums ${
                                                isIncome
                                                    ? "text-[#0f766e]"
                                                    : "text-[#14201c]"
                                            }`}
                                        >
                                            {isIncome ? "+" : "−"}
                                            {currency(transaction.amount)}
                                        </p>
                                        <p className="mt-1 text-xs text-[#829088]">
                                            {formatDate(
                                                transaction.transactionDate,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t border-[#edf1ee] bg-[#fafcfb] px-5 py-3">
                        <p className="text-xs text-[#829088]">
                            Showing up to 5 recent transactions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick actions */}
            <section style={rise(240)} className={riseClass}>
                <div className="mb-4">
                    <h2 className="font-['Unbounded',sans-serif] text-sm font-semibold">
                        Quick actions
                    </h2>
                    <p className="mt-1 text-xs text-[#829088]">
                        Get things done without losing your flow.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => navigate("/transactions")}
                        className={
                            "group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#e3eae6] bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f3d33] hover:shadow-[0_14px_28px_-20px_rgba(15,61,51,0.6)] " +
                            focusRing
                        }
                    >
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eaf2ee] text-[#0f3d33] transition-transform duration-200 group-hover:rotate-90">
                            <Plus size={20} />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold">
                                Add transaction
                            </span>
                            <span className="mt-1 block text-xs text-[#829088]">
                                Record income or expense
                            </span>
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={openAddAccount}
                        className={
                            "group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#e3eae6] bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f3d33] hover:shadow-[0_14px_28px_-20px_rgba(15,61,51,0.6)] " +
                            focusRing
                        }
                    >
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f8f0d8] text-[#8b6a12] transition-transform duration-200 group-hover:scale-110">
                            <Wallet size={20} />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold">
                                Add account
                            </span>
                            <span className="mt-1 block text-xs text-[#829088]">
                                Track another money source
                            </span>
                        </span>
                    </button>

                    <Link
                        to="/statistics"
                        className={
                            "group flex items-center gap-3 rounded-2xl border border-[#e3eae6] bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f3d33] hover:shadow-[0_14px_28px_-20px_rgba(15,61,51,0.6)] " +
                            focusRing
                        }
                    >
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9eef9] text-[#4766a8] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110">
                            <TrendingUp size={20} />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold">
                                View statistics
                            </span>
                            <span className="mt-1 block text-xs text-[#829088]">
                                Explore spending patterns
                            </span>
                        </span>
                    </Link>
                </div>
            </section>

            {/* Account add/edit dialog */}
            {accountModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#14201c]/45 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !isSavingAccount)
                            closeAccountModal();
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="account-modal-title"
                        className="w-full max-w-md animate-[db-pop_0.2s_ease-out_both] overflow-hidden rounded-2xl border border-[#e3eae6] bg-white shadow-2xl motion-reduce:animate-none"
                    >
                        <div className="flex items-start justify-between border-b border-[#edf1ee] p-5">
                            <div>
                                <h2
                                    id="account-modal-title"
                                    className="font-['Unbounded',sans-serif] text-base font-semibold"
                                >
                                    {editingAccountId
                                        ? "Edit account"
                                        : "Add account"}
                                </h2>
                                <p className="mt-1 text-sm text-[#829088]">
                                    Manage a source of your money.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAccountModal}
                                disabled={isSavingAccount}
                                aria-label="Close account dialog"
                                className={
                                    "grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-[#e3eae6] text-[#5b6b65] transition-colors hover:bg-[#f3f6f2] disabled:cursor-not-allowed disabled:opacity-50 " +
                                    focusRing
                                }
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleAccountSubmit}
                            className="space-y-5 p-5"
                            noValidate
                        >
                            <div>
                                <label
                                    htmlFor="accountName"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Account name
                                </label>
                                <input
                                    id="accountName"
                                    autoFocus
                                    value={accountForm.name}
                                    onChange={(e) =>
                                        setAccountForm((previous) => ({
                                            ...previous,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. SBI Savings"
                                    className="w-full rounded-xl border border-[#cfd9d3] px-4 py-3 text-sm outline-none transition-all duration-200 hover:border-[#0f3d33]/50 focus:border-[#0f3d33] focus:ring-4 focus:ring-[#c9a227]/25"
                                />
                            </div>

                            <div>
                                <span
                                    id="accountTypeLabel"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Account type
                                </span>

                                <div
                                    role="radiogroup"
                                    aria-labelledby="accountTypeLabel"
                                    className="grid grid-cols-2 gap-2"
                                >
                                    {ACCOUNT_TYPES.map((option) => {
                                        const selected =
                                            accountForm.type === option.value;
                                        const OptionIcon = option.icon;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                onClick={() =>
                                                    setAccountForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            type: option.value,
                                                        }),
                                                    )
                                                }
                                                className={
                                                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.98] " +
                                                    (selected
                                                        ? "border-[#0f3d33] bg-[#eaf2ee] text-[#0f3d33] ring-4 ring-[#c9a227]/20 "
                                                        : "border-[#cfd9d3] text-[#5b6b65] hover:border-[#0f3d33]/50 hover:bg-[#f7f9f7] ") +
                                                    focusRing
                                                }
                                            >
                                                <span
                                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                                                    style={{
                                                        backgroundColor: `${option.color}1a`,
                                                        color: option.color,
                                                    }}
                                                >
                                                    <OptionIcon size={16} />
                                                </span>
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="accountBalance"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Current balance
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5b6b65]">
                                        ₹
                                    </span>
                                    <input
                                        id="accountBalance"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={accountForm.balance}
                                        onChange={(e) =>
                                            setAccountForm((previous) => ({
                                                ...previous,
                                                balance: e.target.value,
                                            }))
                                        }
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-[#cfd9d3] py-3 pl-9 pr-4 text-sm tabular-nums outline-none transition-all duration-200 hover:border-[#0f3d33]/50 focus:border-[#0f3d33] focus:ring-4 focus:ring-[#c9a227]/25"
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-[#829088]">
                                    The amount currently in this account.
                                </p>
                            </div>

                            {accountError && (
                                <p
                                    role="alert"
                                    className="rounded-lg bg-[#fef3f2] px-3 py-2 text-sm font-medium text-[#b42318]"
                                >
                                    {accountError}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 border-t border-[#edf1ee] pt-4">
                                <button
                                    type="button"
                                    onClick={closeAccountModal}
                                    disabled={isSavingAccount}
                                    className={
                                        "cursor-pointer rounded-xl border border-[#cfd9d3] px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:border-[#0f3d33] hover:bg-[#eaf2ee] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 " +
                                        focusRing
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSavingAccount}
                                    className={
                                        "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0f3d33] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0b2e26] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 " +
                                        focusRing
                                    }
                                >
                                    {isSavingAccount ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Check size={16} />
                                    )}
                                    {isSavingAccount
                                        ? "Saving..."
                                        : editingAccountId
                                          ? "Save changes"
                                          : "Create account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Remove account confirmation */}
            {removeTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#14201c]/45 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !isRemoving)
                            setRemoveTarget(null);
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="remove-title"
                        aria-describedby="remove-desc"
                        className="w-full max-w-sm animate-[db-pop_0.2s_ease-out_both] rounded-2xl border border-[#e3eae6] bg-white p-6 shadow-2xl motion-reduce:animate-none"
                    >
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fef3f2] text-[#b42318]">
                            <Trash2 size={22} />
                        </span>

                        <h2
                            id="remove-title"
                            className="mt-4 font-['Unbounded',sans-serif] text-base font-semibold"
                        >
                            Remove {removeTarget.name}?
                        </h2>
                        <p
                            id="remove-desc"
                            className="mt-2 text-sm text-[#5b6b65]"
                        >
                            This account and its balance of { currency(removeTarget.balance)} will be removed
                            from your dashboard.
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
                                className={
                                    "cursor-pointer rounded-xl border border-[#cfd9d3] px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:border-[#0f3d33] hover:bg-[#eaf2ee] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 " +
                                    focusRing
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmRemove}
                                disabled={isRemoving}
                                className={
                                    "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#b42318] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#912018] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 " +
                                    focusRing
                                }
                            >
                                {isRemoving && (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                )}
                                {isRemoving ? "Removing..." : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
