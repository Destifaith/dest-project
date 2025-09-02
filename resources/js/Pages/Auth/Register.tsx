import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { ThemeProvider } from "@/Components/theme-provider";

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const pageProps = usePage().props as any;

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("register"), {
      onFinish: () => reset("password", "password_confirmation"),
    });
  };

  return (
    <>
      <Head title="Register" />

      <div className="flex min-h-screen">
        {/* Left image side */}
        <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center">
          <img
            src="/signup.png"
            alt="Register Illustration"
            className="max-h-full max-w-full object-cover"
          />
        </div>

        {/* Right form side */}
        <div className="flex w-full lg:w-1/2 items-center justify-center">
          <ThemeProvider>
            <div className="w-full max-w-md p-6 space-y-6">
              {/* Logo + App name */}
              <div className="flex flex-col items-center gap-2">
                <img src="/ha-logo.png" alt="Logo" className="w-24 h-24" />
                {/* <h2 className="text-xl font-bold">Hospitality Answer</h2> */}
              </div>

              <h1 className="text-2xl font-semibold text-center">
                Create an account
              </h1>

              {/* Generic server error */}
              {pageProps.error && (
                <div className="mb-4 text-sm font-medium text-red-600">
                  {pageProps.error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="password_confirmation">Confirm Password</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) =>
                      setData("password_confirmation", e.target.value)
                    }
                    required
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-red-500">
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <Button type="submit" className="w-full" disabled={processing}>
                  Register
                </Button>
              </form>

              {/* Separator */}
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:flex after:items-center after:border-t">
                <span className="bg-background relative z-10 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              {/* Google Signup */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => (window.location.href = route("auth.google.redirect"))}
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.63 2.74 30.15 0 24 0 14.64 0 6.61 5.82 2.69 14.14l7.98 6.19C12.68 13.63 17.9 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.1 24.5c0-1.57-.14-3.09-.39-4.5H24v9h12.65c-.55 2.96-2.2 5.48-4.69 7.19l7.17 5.57C43.85 37.53 46.1 31.46 46.1 24.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.67 28.33c-.5-1.45-.78-2.99-.78-4.58s.28-3.13.78-4.58l-7.98-6.19C.93 16.88 0 20.33 0 24s.93 7.12 2.69 10.42l7.98-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.15 0 11.32-2.03 15.09-5.52l-7.17-5.57c-2.03 1.37-4.64 2.16-7.92 2.16-6.1 0-11.32-4.13-13.33-9.83l-7.98 6.19C6.61 42.18 14.64 48 24 48z"
                  />
                </svg>
                Sign up with Google
              </Button>

              {/* Switch to login */}
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link href={route("login")} className="underline underline-offset-4">
                  Login
                </Link>
              </p>
            </div>
          </ThemeProvider>
        </div>
      </div>
    </>
  );
}
