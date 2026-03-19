import { Link } from "react-router-dom";

export default function Header({ onOpenAuthModal }) {
	const openAuthModal = mode => {
		onOpenAuthModal?.(mode);
	};

	return (
		<header className="relative mx-auto mt-4 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-blue-800/80 bg-blue-900/90 px-6 py-4 shadow-lg shadow-blue-900/30">
			<Link to="/" className="text-lg font-bold tracking-tight text-white sm:text-xl">
				English Center
			</Link>

			<div className="hidden items-center gap-2 rounded-full bg-blue-800/70 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-blue-700/80 sm:inline-flex">
				<span className="h-2 w-2 rounded-full bg-emerald-500" />
				Học online & offline
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => openAuthModal("register")}
					className="rounded-full border border-blue-300/60 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900 shadow-sm transition hover:bg-white"
				>
					Đăng ký
				</button>
				<button
					type="button"
					onClick={() => openAuthModal("login")}
					className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-blue-950 shadow-md shadow-cyan-500/40 transition hover:bg-cyan-400"
				>
					Đăng nhập
				</button>
			</div>
		</header>
	);
}
