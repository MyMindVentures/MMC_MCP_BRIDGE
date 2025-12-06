import { redirect } from "next/navigation";
import { defaultLocale } from "../i18n/config";

export function GET() {
  redirect(`/${defaultLocale}`);
}
