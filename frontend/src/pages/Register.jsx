import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { REGISTER } from "@/constants/testIds";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "customer", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const dashboardPath = (role) => (role === "provider" ? "/provider/dashboard" : "/dashboard");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const result = await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone || null });
    setLoading(false);
    if (result.success) {
      navigate(dashboardPath(result.user.role));
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
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
        <h1 className="font-heading text-2xl font-semibold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join as a customer to book services, or a provider to offer them.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">I want to join as</Label>
            <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
              <SelectTrigger data-testid={REGISTER.roleSelect} className="mt-1.5 border-input bg-transparent text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                <SelectItem value="customer">Customer — book services</SelectItem>
                <SelectItem value="provider">Provider — offer services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input required value={form.name} onChange={update("name")} data-testid={REGISTER.nameInput} placeholder="Jane Doe" className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="email" required value={form.email} onChange={update("email")} data-testid={REGISTER.emailInput} placeholder="you@example.com" className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Phone (optional)</Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={form.phone} onChange={update("phone")} data-testid={REGISTER.phoneInput} placeholder="+1 555 000 0000" className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" required value={form.password} onChange={update("password")} data-testid={REGISTER.passwordInput} placeholder="••••••••" className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Confirm</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" required value={form.confirm} onChange={update("confirm")} data-testid={REGISTER.passwordConfirmInput} placeholder="••••••••" className="border-input bg-transparent pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50" />
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-400" data-testid="register-error-message">{error}</p>}
          <Button type="submit" disabled={loading} data-testid={REGISTER.submitButton} className="w-full bg-blue-500 text-white hover:bg-blue-400">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link data-testid={REGISTER.loginLink} to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
