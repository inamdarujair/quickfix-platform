import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { EmptyState } from "@/components/EmptyState";
import { CATEGORIES } from "@/constants/categories";
import { api } from "@/lib/api";
import { SERVICES_PAGE } from "@/constants/testIds";

export default function Services() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const q = params.get("q") || "";
  const category = params.get("category") || "all";
  const city = params.get("city") || "";
  const sort = params.get("sort") || "newest";

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const fetchServices = useCallback(async (targetPage) => {
    setLoading(true);
    try {
      const { data } = await api.get("/services", {
        params: {
          q: q || undefined,
          category: category !== "all" ? category : undefined,
          city: city || undefined,
          sort,
          page: targetPage,
          limit: 12,
        },
      });
      setItems((prev) => (targetPage === 1 ? data.items : [...prev, ...data.items]));
      setTotal(data.total);
      setPage(targetPage);
    } finally {
      setLoading(false);
    }
  }, [q, category, city, sort]);

  useEffect(() => {
    fetchServices(1);
  }, [fetchServices]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">Browse Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} local professionals ready to help.</p>
      </div>

      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={q}
            onKeyDown={(e) => e.key === "Enter" && updateParam("q", e.target.value)}
            onBlur={(e) => updateParam("q", e.target.value)}
            data-testid={SERVICES_PAGE.searchInput}
            placeholder="Search services..."
            className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50"
          />
        </div>
        <Select value={category} onValueChange={(v) => updateParam("category", v)}>
          <SelectTrigger data-testid={SERVICES_PAGE.categoryFilter} className="border-input bg-transparent text-foreground sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          defaultValue={city}
          onKeyDown={(e) => e.key === "Enter" && updateParam("city", e.target.value)}
          onBlur={(e) => updateParam("city", e.target.value)}
          data-testid={SERVICES_PAGE.cityInput}
          placeholder="City"
          className="border-input bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50 sm:w-36"
        />
        <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
          <SelectTrigger data-testid={SERVICES_PAGE.sortSelect} className="border-input bg-transparent text-foreground sm:w-44">
            <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover text-popover-foreground">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState testId={SERVICES_PAGE.emptyState} title="No services found" description="Try adjusting your filters or search a different category." />
      ) : (
        <>
          <div data-testid={SERVICES_PAGE.resultsGrid} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
          {items.length < total && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => fetchServices(page + 1)}
                data-testid={SERVICES_PAGE.loadMoreButton}
                className="border-border bg-transparent text-foreground hover:bg-accent"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
