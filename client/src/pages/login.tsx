import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<"technician" | "supervisor">("technician");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign in:", { email, password, rememberMe, role });
    
    if (role === "supervisor") {
      setLocation("/supervisor");
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans flex">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white rounded-sm transform rotate-45" />
          </div>
          <span className="text-lg font-bold text-[#06b6d4]">TechApp</span>
        </div>

        {/* Sign In Title */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Sign in</h1>
          <p className="text-slate-400 text-sm md:text-base">
            Don't have an account?{" "}
            <button className="text-[#06b6d4] hover:text-[#0891b2] font-semibold transition-colors" data-testid="link-signup">
              Sign up
            </button>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setRole("technician")}
              className={`py-2 rounded-md text-sm font-medium transition-all ${
                role === "technician"
                  ? "bg-[#06b6d4] text-black shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Technician
            </button>
            <button
              type="button"
              onClick={() => setRole("supervisor")}
              className={`py-2 rounded-md text-sm font-medium transition-all ${
                role === "supervisor"
                  ? "bg-[#06b6d4] text-black shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Supervisor
            </button>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:bg-white/10 transition-colors"
              data-testid="input-email"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:bg-white/10 transition-colors pr-12"
                data-testid="input-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border border-white/20 bg-white/5 accent-[#06b6d4] cursor-pointer"
                data-testid="checkbox-remember"
              />
              <span className="text-sm text-slate-400">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-slate-400 hover:text-[#06b6d4] transition-colors font-medium"
              data-testid="link-forgot-password"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-black font-bold rounded-lg transition-all shadow-lg shadow-[#06b6d4]/30 hover:shadow-xl hover:shadow-[#06b6d4]/40 active:scale-95"
            data-testid="button-signin"
          >
            Sign in
          </button>
        </form>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-black relative overflow-hidden flex-col justify-center items-center px-12">
        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#06b6d4]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0891b2]/5 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-6 max-w-md">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Welcome to our community
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Join us and start building amazing dashboards. Get organized, collaborate with your team, and create beautiful applications with our powerful tools.
            </p>
          </div>

          {/* Community Stats */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <div className="flex -space-x-3">
              {[
                "bg-gradient-to-br from-pink-500 to-rose-500",
                "bg-gradient-to-br from-blue-500 to-cyan-500",
                "bg-gradient-to-br from-purple-500 to-pink-500",
                "bg-gradient-to-br from-green-500 to-emerald-500",
              ].map((gradient, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 ${gradient} rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="text-slate-300 text-sm">
              More than <span className="text-[#06b6d4] font-semibold">17k people</span> joined us. It's your turn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
