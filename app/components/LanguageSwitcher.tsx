"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "../i18n/config";
import { useState } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] && locales.includes(segments[0] as Locale)) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push(`/${segments.join("/")}`);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.1)",
          color: "#fff",
          fontSize: "0.875rem",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
        aria-label="Switch language"
      >
        <span>🌐</span>
        <span>{localeNames[locale]}</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: "0.5rem",
            border: "1px solid rgba(255,255,255,0.2)",
            minWidth: "150px",
            zIndex: 1000,
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          }}
        >
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                background:
                  locale === loc ? "rgba(255,255,255,0.2)" : "transparent",
                color: "#fff",
                fontSize: "0.875rem",
                textAlign: "left",
                cursor: "pointer",
                borderRadius:
                  loc === locales[0]
                    ? "0.5rem 0.5rem 0 0"
                    : loc === locales[locales.length - 1]
                    ? "0 0 0.5rem 0.5rem"
                    : "0",
              }}
              onMouseEnter={(e) => {
                if (locale !== loc) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (locale !== loc) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
