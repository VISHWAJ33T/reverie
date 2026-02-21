import ProtectedSettingsUsers from "../../../../components/protected/settings/protected-settings-users";
import { getProfilesForAdmin } from "@/actions/profile/get-profiles";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage users and admin status",
};

export const revalidate = 0;

export default async function UsersSettingsPage() {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) redirect("/settings");

  const profiles = await getProfilesForAdmin();

  return (
    <div className="max-w-4xl px-10">
      <ProtectedSettingsUsers initialProfiles={profiles ?? []} />
    </div>
  );
}
