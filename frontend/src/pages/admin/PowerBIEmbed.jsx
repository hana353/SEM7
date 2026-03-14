import { useRef, useEffect, useState } from "react";
import api from "../../api/axios";
import * as pbiNamespace from "powerbi-client";
// Hỗ trợ cả default export (UMD/CJS) và named
const pbi = pbiNamespace.default || pbiNamespace;

/**
 * Nhúng report Power BI bằng embed token từ backend.
 * Admin không cần đăng nhập Power BI — token do backend (Service Principal) cấp.
 *
 * @param {string} reportKey - "dashboard" | "revenue"
 * @param {string} [title] - Tiêu đề hiển thị phía trên report
 * @param {string} [description] - Mô tả ngắn
 */
export default function PowerBIEmbed({ reportKey, title, description }) {
  const containerRef = useRef(null);
  const embedRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reportKey || !containerRef.current) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get("/powerbi/embed", { params: { report: reportKey } })
      .then((res) => {
        if (cancelled) return;
        const { embedUrl, accessToken } = res.data;
        if (!embedUrl || !accessToken) {
          setError("Backend không trả về embedUrl hoặc token.");
          setLoading(false);
          return;
        }
        const powerbi = new pbi.service.Service(
          pbi.factories.hpmFactory,
          pbi.factories.wpmpFactory,
          pbi.factories.routerFactory
        );
        const config = {
          type: "report",
          embedUrl,
          accessToken,
          tokenType: pbi.models.TokenType.Embed,
          settings: {
            panes: { filters: { visible: false } },
            navContentPaneEnabled: true,
          },
        };
        try {
          if (embedRef.current) {
            try {
              embedRef.current.off("loaded");
            } catch (_) {}
          }
          const embed = powerbi.embed(containerRef.current, config);
          embedRef.current = embed;
          embed.on("loaded", () => {
            if (!cancelled) setLoading(false);
          });
          embed.on("error", (event) => {
            if (!cancelled) {
              setError(event.detail?.message || "Lỗi tải Power BI report.");
              setLoading(false);
            }
          });
        } catch (e) {
          if (!cancelled) {
            setError(e.message || "Không thể nhúng report.");
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.detail ||
            err.message ||
            "Không lấy được cấu hình nhúng Power BI.";
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (embedRef.current && containerRef.current) {
        try {
          embedRef.current.off("loaded");
          embedRef.current.off("error");
        } catch (_) {}
        embedRef.current = null;
      }
    };
  }, [reportKey]);

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
      {title && (
        <h2 className="text-sm font-semibold text-slate-900 mb-2">{title}</h2>
      )}
      {description && (
        <p className="text-xs text-slate-500 mb-3">{description}</p>
      )}
      <div className="relative w-full rounded-lg border border-slate-200 overflow-hidden bg-slate-50" style={{ minHeight: 480 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <span className="text-sm text-slate-500">Đang tải báo cáo Power BI...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-4 z-10">
            <p className="text-sm text-rose-600 text-center">{error}</p>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: 480 }}
        />
      </div>
    </div>
  );
}
