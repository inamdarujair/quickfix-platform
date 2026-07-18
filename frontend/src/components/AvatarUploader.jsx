import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { api, resolveAvatar, formatApiError } from "@/lib/api";
import { PROFILE_FORM } from "@/constants/testIds";

export const AvatarUploader = ({ user, onUpdated }) => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const src = resolveAvatar(user);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated?.(data);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border bg-muted">
        {src ? (
          <img src={src} alt={user?.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-heading text-xl text-muted-foreground">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          data-testid={PROFILE_FORM.avatarInput}
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          Change photo
        </button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleChange} />
      </div>
    </div>
  );
};
