import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { api, formatApiError } from "@/lib/api";
import { CATEGORIES } from "@/constants/categories";
import { SERVICE_FORM } from "@/constants/testIds";

const emptyForm = { title: "", description: "", category: "plumbing", price: "", price_unit: "fixed", city: "" };

export const ServiceFormModal = ({ service, open, onOpenChange, onSaved }) => {
  const [form, setForm] = useState(service ? { ...emptyForm, ...service } : emptyForm);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price || !form.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      let saved;
      if (service?.id) {
        const { data } = await api.put(`/services/${service.id}`, payload);
        saved = data;
      } else {
        const { data } = await api.post("/services", payload);
        saved = data;
      }
      if (images?.length) {
        const formData = new FormData();
        Array.from(images).forEach((f) => formData.append("files", f));
        const { data } = await api.post(`/services/${saved.id}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        saved = data;
      }
      toast.success(service?.id ? "Service updated" : "Service created");
      onOpenChange(false);
      onSaved?.(saved);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{service?.id ? "Edit Service" : "Add New Service"}</DialogTitle>
        </DialogHeader>

        <div>
          <Label className="text-xs text-muted-foreground">Title</Label>
          <Input value={form.title} onChange={update("title")} data-testid={SERVICE_FORM.titleInput} className="mt-1.5 border-input bg-transparent text-foreground focus-visible:ring-blue-500/50" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea value={form.description} onChange={update("description")} data-testid={SERVICE_FORM.descriptionInput} className="mt-1.5 min-h-[90px] border-input bg-transparent text-foreground focus-visible:ring-blue-500/50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger data-testid={SERVICE_FORM.categorySelect} className="mt-1.5 border-input bg-transparent text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">City</Label>
            <Input value={form.city} onChange={update("city")} data-testid={SERVICE_FORM.cityInput} className="mt-1.5 border-input bg-transparent text-foreground focus-visible:ring-blue-500/50" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Price ($)</Label>
            <Input type="number" min="1" value={form.price} onChange={update("price")} data-testid={SERVICE_FORM.priceInput} className="mt-1.5 border-input bg-transparent text-foreground focus-visible:ring-blue-500/50" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Price Unit</Label>
            <Select value={form.price_unit} onValueChange={(v) => setForm((f) => ({ ...f, price_unit: v }))}>
              <SelectTrigger data-testid={SERVICE_FORM.priceUnitSelect} className="mt-1.5 border-input bg-transparent text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                <SelectItem value="fixed">Fixed price</SelectItem>
                <SelectItem value="hour">Per hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Images (up to 5)</Label>
          <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-accent">
            <Upload className="h-4 w-4" />
            {images?.length ? `${images.length} file(s) selected` : "Click to upload images"}
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple data-testid={SERVICE_FORM.imagesInput} className="hidden" onChange={(e) => setImages(e.target.files)} />
          </label>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading} data-testid={SERVICE_FORM.saveButton} className="w-full bg-blue-500 text-white hover:bg-blue-400">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {service?.id ? "Save Changes" : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
