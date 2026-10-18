
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError("");

    try {
      await login(values);
      navigate("/", { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F9FB] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Wallet size={23} />
          </span>

          <span className="text-2xl font-bold tracking-tight text-slate-900">
            PayTrack
          </span>
        </Link>

        {/* Login card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to manage and reconcile your transactions.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${
                  errors.email
                    ? "border-rose-400 focus:ring-rose-50"
                    : "border-slate-200 focus:border-slate-900 focus:ring-slate-100"
                }`}
              />

              {errors.email && (
                <p className="mt-2 text-xs text-rose-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition focus:ring-4 ${
                    errors.password
                      ? "border-rose-400 focus:ring-rose-50"
                      : "border-slate-200 focus:border-slate-900 focus:ring-slate-100"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-xs text-rose-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* API error */}
            {submitError && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure transaction reconciliation with PayTrack.
        </p>
      </div>
    </main>
  );
}
