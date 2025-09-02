import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { GalleryVerticalEnd } from "lucide-react";

import { ThemeProvider } from "@/Components/theme-provider";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

export default function Login({
  status,
  canResetPassword,
}: {
  status?: string;
  canResetPassword: boolean;
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false as boolean,
  });

  const pageProps = usePage().props as any;

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("login"), {
      onFinish: () => reset("password"),
    });
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Head title="Log in" />

      {/* 2-column split layout */}
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* LEFT: brand + form */}
        <div className="flex flex-col gap-4 p-6 md:p-10">
          {/* brand row */}
          <div className="flex justify-center md:justify-center gap-2">
  <a href="#" className="flex items-center gap-2 font-medium">
    <img src="/ha-logo.png" alt="Logo" className="w-24 h-24" />
    {/* <span>Hospitality Answer</span> */}
  </a>
</div>


          {/* form block */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              {/* Status message */}
              {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                  {status}
                </div>
              )}

              {/* Generic error message from server */}
              {pageProps.error && (
                <div className="mb-4 text-sm font-medium text-red-600">
                  {pageProps.error}
                </div>
              )}

              <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Login to your account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
                  </p>
                </div>

                <div className="grid gap-6">
                  {/* Email */}
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                      autoComplete="username"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      {canResetPassword && (
                        <Link
                          href={route("password.request")}
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              {/* Google Login */}
              <Button variant="outline" className="w-full" asChild>
                <a href={route("auth.google.redirect")} aria-label="Login with Google">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path d="M21.35 11.1h-9.18v2.92h5.43c-.23 1.4-.94 2.58-2 3.38v2.82h3.23c1.89-1.74 2.97-4.3 2.97-7.33 0-.68-.06-1.34-.17-1.99z" fill="#4285F4"/>
                    <path d="M12.17 22c2.7 0 4.97-.9 6.63-2.43l-3.23-2.82c-.9.6-2.06.95-3.4.95-2.62 0-4.85-1.77-5.64-4.15H3.1v2.9C4.75 19.97 8.21 22 12.17 22z" fill="#34A853"/>
                    <path d="M6.53 13.55c-.2-.6-.32-1.24-.32-1.9s.12-1.3.32-1.9V6.85H3.1A9.96 9.96 0 0 0 2 11.65c0 1.59.38 3.1 1.1 4.45l3.43-2.55z" fill="#FBBC05"/>
                    <path d="M12.17 4.88c1.47 0 2.78.5 3.82 1.47l2.85-2.85C17.14 1.8 14.87.82 12.17.82c-3.96 0-7.42 2.03-9.07 5.03l3.43 2.55c.79-2.38 3.02-4.15 5.64-4.15z" fill="#EA4335"/>
                  </svg>
                  Login with Google
                </a>
              </Button>

              {/* Sign up link */}
              <div className="text-center text-sm mt-4">
                Don&apos;t have an account?{" "}
                <Link href={route("register")} className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: image panel */}
        <div className="relative hidden lg:block bg-muted">
          <img
            src="/login.png"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute left-0 top-0 h-full w-px bg-border" />
        </div>
      </div>
    </ThemeProvider>
  );
}
