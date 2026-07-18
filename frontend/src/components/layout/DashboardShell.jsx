import { cn } from "@/lib/utils";

export const DashboardShell = ({ title, subtitle, tabs, activeTab, onTabChange, children }) => (
  <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
    <div className="mb-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    <div className="mb-8 flex gap-2 overflow-x-auto border-b border-border pb-px">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          data-testid={tab.testId}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
            activeTab === tab.key ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          {tab.label}
          {activeTab === tab.key && <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-blue-500" />}
        </button>
      ))}
    </div>
    <div>{children}</div>
  </div>
);
