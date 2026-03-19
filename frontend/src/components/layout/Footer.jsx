import { Link } from "react-router-dom";

export default function Footer({ onOpenAuthModal }) {
	return (
		<footer className="relative mt-10 border-t border-blue-800/80 bg-blue-950/95 text-blue-100 backdrop-blur">
			<div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-4">
				<div className="md:col-span-2">
					<p className="text-base font-semibold text-white">English Center</p>
					<p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/90">
						Nền tảng đăng ký, mua và học các khóa tiếng Anh cho trung tâm anh ngữ,
						kết hợp linh hoạt giữa lớp online và lớp offline tại cơ sở.
					</p>
					<div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
						<span className="rounded-full bg-blue-800/70 px-3 py-1 text-blue-100 ring-1 ring-blue-700/80">
							Học trực tuyến tương tác
						</span>
						<span className="rounded-full bg-emerald-700/30 px-3 py-1 text-emerald-200 ring-1 ring-emerald-600/40">
							Lớp học tại trung tâm
						</span>
						<span className="rounded-full bg-amber-700/30 px-3 py-1 text-amber-200 ring-1 ring-amber-600/40">
							Tư vấn lộ trình cá nhân
						</span>
					</div>
				</div>

				<div>
					<p className="text-sm font-semibold text-white">Liên kết nhanh</p>
					<ul className="mt-3 space-y-2 text-sm text-blue-100/90">
						<li>
							<Link to="/courses" className="transition hover:text-cyan-300">
								Danh sách khóa học
							</Link>
						</li>
						<li>
							<button
								type="button"
								onClick={() => onOpenAuthModal?.("register")}
								className="transition hover:text-cyan-300"
							>
								Đăng ký tài khoản
							</button>
						</li>
						<li>
							<button
								type="button"
								onClick={() => onOpenAuthModal?.("login")}
								className="transition hover:text-cyan-300"
							>
								Đăng nhập học viên
							</button>
						</li>
					</ul>
				</div>

				<div>
					<p className="text-sm font-semibold text-white">Hỗ trợ</p>
					<ul className="mt-3 space-y-2 text-sm text-blue-100/90">
						<li>Hotline: 0900 123 456</li>
						<li>Email: support@englishcenter.vn</li>
						<li>Thời gian: 08:00 - 21:00 mỗi ngày</li>
					</ul>
				</div>
			</div>

			<div className="border-t border-blue-800/80 py-4">
				<p className="mx-auto w-full max-w-6xl px-6 text-xs text-blue-200/80">
					© {new Date().getFullYear()} English Center. Nền tảng học và bán khóa học tiếng Anh online/offline.
				</p>
			</div>
		</footer>
	);
}
