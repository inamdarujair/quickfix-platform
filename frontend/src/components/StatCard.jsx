import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StatCard = ({ icon: Icon, label, value, accent = "text-blue-400", delay = 0, testId }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    data-testid={testId}
    className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
  >
    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {Icon && <Icon className={cn("h-4 w-4", accent)} />}
    </div>
    <p className="mt-3 font-heading text-3xl font-semibold text-foreground">{value}</p>
  </motion.div>
);
