import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, MapPin, ShieldCheck, ArrowLeft } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BookingModal } from "@/components/booking/BookingModal";
import { Button } from "@/components/ui/button";
import { api, resolveImage, resolveAvatar } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getCategory } from "@/constants/categories";
import { SERVICE_DETAIL } from "@/constants/testIds";
import { toast } from "@/components/ui/sonner";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/services/${id}`)
      .then(({ data }) => setService(data))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate("/login", { state: { from: `/services/${id}` } });
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customer accounts can book services");
      return;
    }
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-zinc-400">Service not found.</p>
        <Link to="/services" className="mt-3 text-sm text-blue-400">Back to services</Link>
      </div>
    );
  }

  const images = service.images?.length ? service.images.map((p) => resolveImage({ images: [p] })) : [resolveImage(service)];
  const category = getCategory(service.category);
  const providerAvatar = resolveAvatar(service.provider);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div data-testid={SERVICE_DETAIL.gallery} className="overflow-hidden rounded-2xl border border-white/10">
            <img src={images[activeImage]} alt={service.title} className="h-80 w-full object-cover sm:h-96" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`h-16 w-16 overflow-hidden rounded-lg border ${activeImage === i ? "border-blue-500" : "border-white/10"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              <CategoryIcon category={service.category} className="h-3.5 w-3.5 text-blue-400" />
              {category?.label}
            </span>
          </div>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white">{service.title}</h1>
          <div className="mt-2 flex items-center gap-4">
            <StarRating rating={service.rating_avg} count={service.rating_count} />
            <span className="flex items-center gap-1 text-sm text-zinc-500">
              <MapPin className="h-3.5 w-3.5" /> {service.city}
            </span>
          </div>
          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-zinc-400">{service.description}</p>

          <div data-testid={SERVICE_DETAIL.reviewsSection} className="mt-10">
            <h2 className="font-heading text-xl font-medium text-white">Reviews ({service.reviews?.length || 0})</h2>
            {service.reviews?.length ? (
              <div className="mt-4 space-y-4">
                {service.reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-white/10 bg-[#1C1C22] p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{r.customer_name}</p>
                      <StarRating rating={r.rating} showValue={false} />
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-zinc-500">{r.comment}</p>}
                    {r.photos?.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {r.photos.map((path, i) => (
                          <img
                            key={i}
                            src={resolveImage({ images: [path] })}
                            alt="Review attachment"
                            data-testid={`review-photo-${r.id}-${i}`}
                            className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">No reviews yet. Be the first to book and review this service.</p>
            )}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#12121A] p-6">
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-3xl font-semibold text-white">${service.price}</span>
              <span className="text-sm text-zinc-500">{service.price_unit === "hour" ? "per hour" : "fixed price"}</span>
            </div>
            <Button
              onClick={handleBookNow}
              data-testid={SERVICE_DETAIL.bookNowButton}
              className="mt-5 w-full bg-blue-500 text-white hover:bg-blue-400"
            >
              Book Now
            </Button>

            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
              <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-[#1C1C22]">
                {providerAvatar ? (
                  <img src={providerAvatar} alt={service.provider?.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-500">{service.provider?.name?.charAt(0)}</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-white">{service.provider?.name}</p>
                  {service.provider?.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />}
                </div>
                <StarRating rating={service.provider?.rating_avg} count={service.provider?.rating_count} size={12} />
              </div>
            </div>
            {service.provider?.bio && <p className="mt-4 text-sm text-zinc-500">{service.provider.bio}</p>}
          </div>
        </motion.div>
      </div>

      <BookingModal service={service} open={bookingOpen} onOpenChange={setBookingOpen} onBooked={() => navigate("/dashboard")} />
    </div>
  );
}
