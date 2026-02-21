"use client";

import { setUserIsAdmin } from "@/actions/profile/update-profile-admin";
import type { ProfileListItem } from "@/actions/profile/get-profiles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { FC, useState } from "react";
import toast from "react-hot-toast";

interface ProtectedSettingsUsersProps {
  initialProfiles: ProfileListItem[];
}

const ProtectedSettingsUsers: FC<ProtectedSettingsUsersProps> = ({
  initialProfiles,
}) => {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleToggleAdmin(userId: string, currentValue: boolean) {
    setUpdatingId(userId);
    const result = await setUserIsAdmin(userId, !currentValue);
    setUpdatingId(null);
    if (result.success) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, is_admin: !currentValue } : p
        )
      );
      toast.success("Admin status updated");
    } else {
      toast.error(result.error ?? "Failed to update");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Only admins can see this page. Toggle &quot;Admin&quot; to allow a
          user to manage categories, the about page, and set other users as
          admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No profiles found.
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.full_name || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {profile.username || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {profile.email || "—"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={profile.is_admin}
                      disabled={updatingId === profile.id}
                      onCheckedChange={() =>
                        handleToggleAdmin(profile.id, profile.is_admin)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProtectedSettingsUsers;
