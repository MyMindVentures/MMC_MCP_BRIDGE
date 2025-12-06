import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./app/i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
