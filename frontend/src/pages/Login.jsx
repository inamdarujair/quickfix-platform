import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, Loader2, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LOGIN } from "@/constants/testIds";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dashboardPath = (role) => (role === "admin" ? "/admin/dashboard" : role === "provider" ? "/provider/dashboard" : "/dashboard");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(location.state?.from || dashboardPath(result.user.role));
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8"
      >
        <Link to="/" className="mb-6 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
            <Wrench className="h-4 w-4" />
          </span>
          <span className="font-heading text-lg font-semibold text-foreground">QuickFix</span>
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to manage your bookings and services.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid={LOGIN.emailInput}
                placeholder="you@example.com"
                className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid={LOGIN.passwordInput}
                placeholder="••••••••"
                className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-400" data-testid="login-error-message">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            data-testid={LOGIN.submitButton}
            className="w-full bg-blue-500 text-white hover:bg-blue-400"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link data-testid={LOGIN.registerLink} to="/register" className="font-medium text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
