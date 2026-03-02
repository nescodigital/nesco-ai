"use client";

import { useLocale } from "next-intl";
import { usePathname, Link } from "@/navigation";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <Link
      href={pathname}
      locale={locale === "ro" ? "en" : "ro"}
      className="text-[13px] font-semibold transition-colors"
      style={{
        color: "rgba(255,255,255,0.45)",
        padding: "4px 8px",
        borderRadius: "6px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
        textDecoration: "none",
      }}
    >
      {locale === "ro" ? "EN" : "RO"}
    </Link>
  );
}
