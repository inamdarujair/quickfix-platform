import { Link, useLocation } from "react-router-dom";
import { StarRating } from "@/components/StarRating";
import { CategoryIcon } from "@/components/CategoryIcon";
import { resolveImage } from "@/lib/api";
import { getCategory } from "@/constants/categories";
import { SERVICE_CARD } from "@/constants/testIds";
import { motion } from "framer-motion";

export const ServiceCard = ({ service, index = 0 }) => {
  const category = getCategory(service.category);
  const image = resolveImage(service);
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link
        to={`/services/${service.id}`}
        state={{ from: location.pathname + location.search }}
        data-testid={SERVICE_CARD.link(service.id)}
        className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C22] transition-transform duration-300 hover:-translate-y-1 hover:border-white/20"
      >
        <div data-testid={SERVICE_CARD.container(service.id)} className="relative h-44 w-full overflow-hidden">
          {image && (
            <img
              src={image}
              alt={service.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-zinc-200 backdrop-blur-md">
            <CategoryIcon category={service.category} className="h-3.5 w-3.5 text-blue-400" />
            {category?.label}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-heading text-lg font-medium leading-tight text-white line-clamp-1">{service.title}</h3>
          <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{service.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <StarRating rating={service.rating_avg} count={service.rating_count} />
            <span className="font-heading text-base font-semibold text-white">
              ${service.price}
              <span className="text-xs font-normal text-zinc-500">{service.price_unit === "hour" ? "/hr" : ""}</span>
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-xs text-zinc-500">{service.provider?.name}</span>
            <span className="text-xs text-zinc-500">{service.city}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
