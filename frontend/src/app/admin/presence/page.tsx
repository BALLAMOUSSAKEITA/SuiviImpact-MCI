import { redirect } from "next/navigation";

export default function PresenceIndexPage() {
  redirect("/admin/presence/personnel");
}
