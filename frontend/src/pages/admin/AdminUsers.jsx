import { useEffect, useState } from "react";
import { Loader2, Search, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { resolveAvatar, api, formatApiError } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { ADMIN_DASHBOARD, ADMIN_USER_ROW } from "@/constants/testIds";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/users", { params: { role: role !== "all" ? role : undefined, q: q || undefined } })
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [role]);

  const handleBlock = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-block`);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-verify`);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} data-testid={ADMIN_DASHBOARD.userSearchInput} placeholder="Search by name or email" className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50" />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger data-testid={ADMIN_DASHBOARD.roleFilter} className="border-input bg-transparent text-foreground sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="provider">Providers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {users.map((u) => {
                const avatar = resolveAvatar(u);
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-full border border-border bg-muted">
                          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div>
                          <p className="text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {u.role}
                      {u.role === "provider" && u.is_verified && <ShieldCheck className="ml-1.5 inline h-3.5 w-3.5 text-blue-400" />}
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.is_blocked ? "text-red-400" : "text-emerald-400"}>{u.is_blocked ? "Blocked" : "Active"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {u.role === "provider" && (
                          <Button size="sm" variant="outline" onClick={() => handleVerify(u.id)} data-testid={ADMIN_USER_ROW.verifyButton(u.id)} className="border-border bg-transparent text-muted-foreground hover:bg-accent">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleBlock(u.id)} data-testid={ADMIN_USER_ROW.blockButton(u.id)} className="border-border bg-transparent text-amber-400 hover:bg-amber-500/10">
                          <ShieldBan className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(u.id)} data-testid={ADMIN_USER_ROW.deleteButton(u.id)} className="border-border bg-transparent text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
