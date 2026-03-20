import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredUser, hasValidSession } from "../../auth/session";

export default function Header({ onOpenAuthModal }) {
	const navigate = useNavigate();
	const [currentUser, setCurrentUser] = useState(() =>
		hasValidSession() ? getStoredUser() : null
	);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const userMenuRef = useRef(null);

	const navItems = [
		{ label: "Trang chủ", type: "link", to: "/" },
		{ label: "Tất cả khóa học", type: "link", to: "/courses" },
		{ label: "Dịch vụ", type: "anchor", href: "#dich-vu" },
		{ label: "Về chúng tôi", type: "anchor", href: "#ve-chung-toi" },
	];

	const displayName = useMemo(() => {
		if (!currentUser) return "";
		return (
			currentUser.full_name ||
			currentUser.name ||
			currentUser.email ||
			"Người dùng"
		);
	}, [currentUser]);

	const userInitial = useMemo(() => {
		if (!displayName) return "U";
		return displayName.trim().charAt(0).toUpperCase();
	}, [displayName]);

	const avatarUrl = useMemo(() => {
		if (!currentUser) return "";
		return currentUser.avatar_url || currentUser.avatar || "";
	}, [currentUser]);

	useEffect(() => {
		const refreshAuthUser = () => {
			setCurrentUser(hasValidSession() ? getStoredUser() : null);
		};

		window.addEventListener("storage", refreshAuthUser);
		window.addEventListener("auth:changed", refreshAuthUser);

		return () => {
			window.removeEventListener("storage", refreshAuthUser);
			window.removeEventListener("auth:changed", refreshAuthUser);
		};
	}, []);

	useEffect(() => {
		if (!showUserMenu) return;

		const onPointerDown = event => {
			if (!userMenuRef.current?.contains(event.target)) {
				setShowUserMenu(false);
			}
		};

		const onKeyDown = event => {
			if (event.key === "Escape") {
				setShowUserMenu(false);
			}
		};

		document.addEventListener("mousedown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("mousedown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [showUserMenu]);

	const openAuthModal = mode => {
		onOpenAuthModal?.(mode);
	};

	const handleOpenProfile = () => {
		setShowUserMenu(false);
		navigate("/studenthomepage?tab=dashboard");
	};

	return (
		<header className="relative mx-auto mt-4 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-blue-800/80 bg-blue-900/90 px-6 py-4 shadow-lg shadow-blue-900/30">
			<Link to="/" className="text-lg font-bold tracking-tight text-white sm:text-xl">
				English Center
			</Link>

			<nav className="hidden items-center gap-1 rounded-full bg-blue-800/70 p-1 text-sm font-medium text-blue-100 ring-1 ring-blue-700/80 md:flex">
				{navItems.map(item =>
					item.type === "link" ? (
						<Link
							key={item.label}
							to={item.to}
							className="rounded-full px-3 py-1.5 transition hover:bg-blue-700/80 hover:text-white"
						>
							{item.label}
						</Link>
					) : (
						<a
							key={item.label}
							href={item.href}
							className="rounded-full px-3 py-1.5 transition hover:bg-blue-700/80 hover:text-white"
						>
							{item.label}
						</a>
					)
				)}
			</nav>

			{currentUser ? (
				<div className="relative" ref={userMenuRef}>
					<button
						type="button"
						onClick={() => setShowUserMenu(prev => !prev)}
						className="flex items-center gap-3 rounded-full bg-blue-800/70 px-3 py-1.5 ring-1 ring-blue-700/80 transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-cyan-300"
						aria-haspopup="menu"
						aria-expanded={showUserMenu}
					>
						<div className="min-w-0 text-left">
							<p className="max-w-40 truncate text-sm font-semibold text-white">{displayName}</p>
							<p className="text-[11px] text-blue-200">Đã đăng nhập</p>
						</div>
						{avatarUrl ? (
							<img
								src={avatarUrl}
								alt="Avatar người dùng"
								className="h-9 w-9 rounded-full object-cover shadow-md"
							/>
						) : (
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-blue-950 shadow-md shadow-cyan-500/40">
								{userInitial}
							</div>
						)}
					</button>

					{showUserMenu && (
						<div
							role="menu"
							className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
						>
							<button
								type="button"
								role="menuitem"
								onClick={handleOpenProfile}
								className="block w-full px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
							>
								Hồ sơ cá nhân
							</button>
						</div>
					)}
				</div>
			) : (
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
			)}
		</header>
	);
}
