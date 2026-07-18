import { useEffect, useState } from "react";
import { Loader2, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveImage, api, formatApiError } from "@/lib/api";
import { getCategory } from "@/constants/categories";
import { toast } from "@/components/ui/sonner";
import { ADMIN_SERVICE_ROW } from "@/constants/testIds";

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/services")
      .then(({ data }) => setServices(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggle = async (id) => {
    try {
      await api.put(`/admin/services/${id}/toggle-active`);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success("Service deleted");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {services.map((s) => {
            const image = resolveImage(s);
            const category = getCategory(s.category);
            return (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-lg border border-border bg-muted">
                      {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{category?.label}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.provider_name}</td>
                <td className="px-4 py-3 text-foreground/80">${s.price}</td>
                <td className="px-4 py-3">
                  <span className={s.is_active ? "text-emerald-400" : "text-muted-foreground"}>{s.is_active ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleToggle(s.id)} data-testid={ADMIN_SERVICE_ROW.toggleButton(s.id)} className="border-border bg-transparent text-amber-400 hover:bg-amber-500/10">
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(s.id)} data-testid={ADMIN_SERVICE_ROW.deleteButton(s.id)} className="border-border bg-transparent text-red-400 hover:bg-red-500/10">
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
  );
};
