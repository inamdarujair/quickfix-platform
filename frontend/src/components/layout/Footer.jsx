import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border bg-background py-12">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white">
              <Wrench className="h-3.5 w-3.5" />
            </span>
            <span className="font-heading text-base font-semibold text-foreground">QuickFix</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Book trusted local professionals for every job around your home, in minutes.
          </p>
        </div>
        <div className="flex gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Platform</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/services" className="transition-colors hover:text-foreground">Browse Services</Link>
              <Link to="/register" className="transition-colors hover:text-foreground">Become a Provider</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Account</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/login" className="transition-colors hover:text-foreground">Log in</Link>
              <Link to="/register" className="transition-colors hover:text-foreground">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} QuickFix. All rights reserved.
      </div>
    </div>
  </footer>
);
