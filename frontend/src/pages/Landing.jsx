import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ShieldCheck, Clock, Star, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { LANDING } from "@/constants/testIds";

const STEPS = [
  { title: "Search a service", description: "Browse categories or search for exactly what you need, filtered by city and price." },
  { title: "Book instantly", description: "Pick a date and time slot that works for you and send a request in seconds." },
  { title: "Get it done", description: "A verified local pro shows up, does the job, and you leave a review." },
];

export default function Landing() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/services?q=${encodeURIComponent(query)}` : "/services");
  };

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden px-4 pt-16 pb-24 md:px-8 md:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-12 lg:col-span-7"
          >
            <span className="inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-muted-foreground">
              Trusted by 12,000+ homeowners
            </span>
            <h1 className="mt-6 font-heading text-4xl font-light leading-none tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Local pros for every job,
              <br />
              <span className="font-medium text-blue-400">booked in minutes.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              QuickFix connects you with verified plumbers, electricians, cleaners and more — with transparent pricing and real reviews.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-border bg-card/60 p-2 backdrop-blur-xl">
              <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                data-testid={LANDING.heroSearchInput}
                placeholder="Try 'plumber' or 'house cleaning'"
                className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                data-testid={LANDING.heroSearchButton}
                className="shrink-0 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Search
              </button>
            </form>

            <div className="mt-10 flex flex-wrap gap-8">
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">4.9<span className="text-sm text-muted-foreground">/5</span></p>
                <p className="text-xs text-muted-foreground">Average rating</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">10</p>
                <p className="text-xs text-muted-foreground">Service categories</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground">24/7</p>
                <p className="text-xs text-muted-foreground">Booking support</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="col-span-12 lg:col-span-5"
          >
            <div className="relative h-full overflow-hidden rounded-3xl border border-border">
              <img
                src="https://images.pexels.com/photos/18033166/pexels-photo-18033166.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=940"
                alt="Modern home service"
                className="h-full min-h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["2505053", "2505054"].map((n, i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-black bg-zinc-700" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-200">Booking confirmed with Marcus R.</p>
                </div>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Browse by category</h2>
              <p className="mt-1 text-sm text-muted-foreground">Everything your home needs, from one platform.</p>
            </div>
            <Link to="/services" className="hidden items-center gap-1 text-sm text-blue-400 hover:text-blue-300 sm:flex">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  to={`/services?category=${cat.key}`}
                  data-testid={LANDING.categoryCard(cat.key)}
                  className="group relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 transition-transform hover:-translate-y-1"
                >
                  <img src={cat.image} alt={cat.label} className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity group-hover:opacity-45" />
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <CategoryIcon category={cat.key} className="h-4 w-4" />
                  </div>
                  <span className="relative font-heading text-sm font-medium text-white">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-border bg-card p-8 md:p-14">
          <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">How QuickFix works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <span className="font-heading text-4xl font-light text-blue-500/40">0{i + 1}</span>
                <h3 className="mt-3 font-heading text-lg font-medium text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Verified professionals", desc: "Every provider is reviewed and vetted before joining QuickFix." },
            { icon: Clock, title: "Fast response", desc: "Most booking requests are confirmed within the hour." },
            { icon: Star, title: "Real reviews", desc: "Ratings come only from customers with a completed booking." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-muted/20 p-6">
              <item.icon className="h-5 w-5 text-blue-400" />
              <h3 className="mt-4 font-heading text-base font-medium text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-gradient-to-br from-blue-500/10 to-transparent p-10 text-center md:p-16">
          <h2 className="font-heading text-3xl font-medium tracking-tight text-foreground">Ready to get things fixed?</h2>
          <p className="mt-3 text-sm text-muted-foreground">Join thousands of homeowners booking trusted local pros every week.</p>
          <Link
            to="/register"
            data-testid={LANDING.heroGetStartedButton}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
