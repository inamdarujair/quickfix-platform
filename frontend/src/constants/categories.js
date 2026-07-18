export const CATEGORIES = [
  { key: "plumbing", label: "Plumbing", icon: "Wrench", image: "https://images.unsplash.com/photo-1768321916212-17ae334a3d63" },
  { key: "electrical", label: "Electrical", icon: "Zap", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?crop=entropy&cs=srgb&fm=jpg&q=85" },
  { key: "cleaning", label: "Cleaning", icon: "Sparkles", image: "https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { key: "painting", label: "Painting", icon: "Paintbrush", image: "https://images.pexels.com/photos/7218579/pexels-photo-7218579.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { key: "carpentry", label: "Carpentry", icon: "Hammer", image: "https://images.unsplash.com/photo-1768321918210-a775e4c88f08" },
  { key: "ac_repair", label: "AC Repair", icon: "Snowflake", image: "https://images.pexels.com/photos/38190070/pexels-photo-38190070.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { key: "appliance_repair", label: "Appliance Repair", icon: "Settings2", image: "https://images.pexels.com/photos/6720523/pexels-photo-6720523.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { key: "pest_control", label: "Pest Control", icon: "Bug", image: "https://images.unsplash.com/photo-1768321915339-b88858824bc6" },
  { key: "gardening", label: "Gardening", icon: "Leaf", image: "https://images.pexels.com/photos/4246271/pexels-photo-4246271.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { key: "moving", label: "Moving", icon: "Truck", image: "https://images.pexels.com/photos/7203849/pexels-photo-7203849.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
];

export const getCategory = (key) => CATEGORIES.find((c) => c.key === key);

export const BOOKING_STATUS_STYLES = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  confirmed: { label: "Confirmed", className: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  completed: { label: "Completed", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Cancelled", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-400 border-red-500/30" },
};
