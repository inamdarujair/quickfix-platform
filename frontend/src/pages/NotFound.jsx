import { Link } from "react-router-dom";
import { Wrench, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
        <Wrench className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-heading text-4xl font-semibold text-foreground">404</h1>
      <p className="mt-2 text-muted-foreground">This page couldn't be fixed. Let's get you back home.</p>
      <Link
        to="/"
        data-testid="not-found-home-link"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
      >
        <Home className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
