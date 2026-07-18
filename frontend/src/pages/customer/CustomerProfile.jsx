import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AvatarUploader } from "@/components/AvatarUploader";
import { toast } from "@/components/ui/sonner";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PROFILE_FORM } from "@/constants/testIds";

export const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    city: user?.city || "",
    address: user?.address || "",
  });
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put("/users/profile", form);
      updateUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <AvatarUploader user={user} onUpdated={updateUser} />

      <div>
        <Label className="text-xs text-zinc-400">Full Name</Label>
        <Input value={form.name} onChange={update("name")} data-testid={PROFILE_FORM.nameInput} className="mt-1.5 border-white/10 bg-transparent text-white focus-visible:ring-blue-500/50" />
      </div>
      <div>
        <Label className="text-xs text-zinc-400">Phone</Label>
        <Input value={form.phone} onChange={update("phone")} data-testid={PROFILE_FORM.phoneInput} className="mt-1.5 border-white/10 bg-transparent text-white focus-visible:ring-blue-500/50" />
      </div>
      <div>
        <Label className="text-xs text-zinc-400">City</Label>
        <Input value={form.city} onChange={update("city")} data-testid={PROFILE_FORM.cityInput} className="mt-1.5 border-white/10 bg-transparent text-white focus-visible:ring-blue-500/50" />
      </div>
      <div>
        <Label className="text-xs text-zinc-400">Address</Label>
        <Textarea value={form.address} onChange={update("address")} data-testid={PROFILE_FORM.addressInput} className="mt-1.5 border-white/10 bg-transparent text-white focus-visible:ring-blue-500/50" />
      </div>
      <Button onClick={handleSave} disabled={loading} data-testid={PROFILE_FORM.saveButton} className="bg-blue-500 text-white hover:bg-blue-400">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save changes
      </Button>
    </div>
  );
};
