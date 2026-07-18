import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-white/10 bg-[#0A0A0A] py-12">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white">
              <Wrench className="h-3.5 w-3.5" />
            </span>
            <span className="font-heading text-base font-semibold text-white">QuickFix</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-zinc-500">
            Book trusted local professionals for every job around your home, in minutes.
          </p>
        </div>
        <div className="flex gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Platform</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-400">
              <Link to="/services" className="transition-colors hover:text-white">Browse Services</Link>
              <Link to="/register" className="transition-colors hover:text-white">Become a Provider</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Account</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-400">
              <Link to="/login" className="transition-colors hover:text-white">Log in</Link>
              <Link to="/register" className="transition-colors hover:text-white">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-white/5 pt-6 text-xs text-zinc-600">
        © {new Date().getFullYear()} QuickFix. All rights reserved.
      </div>
    </div>
  </footer>
);
