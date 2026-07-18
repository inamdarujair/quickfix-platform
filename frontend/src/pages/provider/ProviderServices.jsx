import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { StarRating } from "@/components/StarRating";
import { ServiceFormModal } from "@/pages/provider/ServiceFormModal";
import { toast } from "@/components/ui/sonner";
import { api, resolveImage, formatApiError } from "@/lib/api";
import { getCategory } from "@/constants/categories";
import { PROVIDER_DASHBOARD, PROVIDER_SERVICE_ROW } from "@/constants/testIds";

export const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/provider/services")
      .then(({ data }) => setServices(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      toast.success("Service deactivated");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          data-testid={PROVIDER_DASHBOARD.addServiceButton}
          className="bg-blue-500 text-white hover:bg-blue-400"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : services.length === 0 ? (
        <EmptyState title="No services yet" description="Add your first service to start receiving bookings." testId="provider-services-empty" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const category = getCategory(svc.category);
            const image = resolveImage(svc);
            return (
              <div key={svc.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C22]">
                <div className="relative h-32 w-full">
                  {image && <img src={image} alt={svc.title} className="h-full w-full object-cover" />}
                  {!svc.is_active && (
                    <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-zinc-300">Inactive</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-zinc-500">{category?.label}</p>
                  <h3 className="mt-1 font-heading text-base font-medium text-white line-clamp-1">{svc.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <StarRating rating={svc.rating_avg} count={svc.rating_count} size={12} />
                    <span className="text-sm font-medium text-white">${svc.price}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(svc);
                        setModalOpen(true);
                      }}
                      data-testid={PROVIDER_SERVICE_ROW.editButton(svc.id)}
                      className="flex-1 border-white/10 bg-transparent text-zinc-200 hover:bg-white/5"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(svc.id)}
                      data-testid={PROVIDER_SERVICE_ROW.deleteButton(svc.id)}
                      className="border-white/10 bg-transparent text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ServiceFormModal
        service={editing}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={load}
      />
    </div>
  );
};
