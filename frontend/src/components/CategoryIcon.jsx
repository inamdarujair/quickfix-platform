import { Wrench, Zap, Sparkles, Paintbrush, Hammer, Snowflake, Settings2, Bug, Leaf, Truck } from "lucide-react";

const ICONS = {
  plumbing: Wrench,
  electrical: Zap,
  cleaning: Sparkles,
  painting: Paintbrush,
  carpentry: Hammer,
  ac_repair: Snowflake,
  appliance_repair: Settings2,
  pest_control: Bug,
  gardening: Leaf,
  moving: Truck,
};

export const CategoryIcon = ({ category, className }) => {
  const Icon = ICONS[category] || Wrench;
  return <Icon className={className} />;
};
