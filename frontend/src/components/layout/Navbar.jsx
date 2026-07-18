import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Wrench, Sun, Moon, Menu, X, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NAVBAR } from "@/constants/testIds";

const dashboardPath = (role) => (role === "admin" ? "/admin/dashboard" : role === "provider" ? "/provider/dashboard" : "/dashboard");

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" data-testid={NAVBAR.logo} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
            <Wrench className="h-4 w-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">QuickFix</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/services" data-testid={NAVBAR.servicesLink} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Browse Services
          </Link>
          {user && (
            <Link to={dashboardPath(user.role)} data-testid={NAVBAR.dashboardLink} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          )}
          {user?.role === "customer" && (
            <Link to="/chat" data-testid="navbar-chat-link" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            data-testid={NAVBAR.themeToggle}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <button
              data-testid={NAVBAR.logoutButton}
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          ) : (
            <>
              <Link data-testid={NAVBAR.loginButton} to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Log in
              </Link>
              <Link
                data-testid={NAVBAR.registerButton}
                to="/register"
                className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button data-testid={NAVBAR.mobileMenuButton} className="text-muted-foreground md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/services" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
              Browse Services
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath(user.role)} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
                  Dashboard
                </Link>
                {user.role === "customer" && (
                  <Link to="/chat" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
                    Ask AI
                  </Link>
                )}
                <button onClick={handleLogout} className="text-left text-sm text-muted-foreground">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-sm font-medium text-blue-400">
                  Get Started
                </Link>
              </>
            )}
            <button
              data-testid={`${NAVBAR.themeToggle}-mobile`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-1.5 text-left text-sm text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
