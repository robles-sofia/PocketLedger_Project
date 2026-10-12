import Link from "next/link";

const Pages = {
    dashboard: "/dashboard",
    accounts: "/accounts",
    budgets: "/budgets",
    import: "/import",
    transactions: "/transactions",
    settings: "/settings",
    login: "/login",
};
export default function Navbar() {
    return (
        <div className="flex flex-row justify-content-center align-items-center
        gap-1">
            <span className="basis-1/4 border-8 border-double border-red p-2 rounded-lg text-center">
                <Link href={Pages.dashboard}>PocketLedger</Link>
            </span>
            <nav className="grow grid grid-cols-4 gap-4 text-center
            border-8 border-double border-red p-2 rounded-lg">
                <Link href={Pages.dashboard}>Dashboard</Link>
                <Link href={Pages.accounts}>Accounts</Link>
                <Link href={Pages.budgets}>Budgets</Link>
                <Link href={Pages.import}>Import</Link>
                <Link href={Pages.transactions} >Transactions</Link>
                <Link href={Pages.settings}>Settings</Link>
                <Link href={Pages.login}>Login</Link>
            </nav>
        </div>
    );
}
