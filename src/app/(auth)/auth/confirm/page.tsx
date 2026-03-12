"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/server/supabase/supabaseClient";
import { Icons } from "~/components/Icons";
import { Button } from "~/components/ui/button";

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if user is authenticated after email confirmation
        const { data: { session }, error } = await supabase().auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setStatus("error");
          setMessage("Failed to verify your email. Please try again.");

          return;
        }

        if (session) {
          setStatus("success");
          setMessage("Email confirmed successfully! Redirecting to dashboard...");
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          // If no session yet, wait a bit and check again
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase().auth.getSession();

            if (retrySession) {
              setStatus("success");
              setMessage("Email confirmed successfully! Redirecting to dashboard...");
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
            } else {
              setStatus("success");
              setMessage("Email confirmed successfully! Please log in to continue.");
            }
          }, 1000);
        }
      } catch (err) {
        console.error("Confirmation error:", err);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try logging in.");
      }
    };

    handleEmailConfirmation();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-lg">
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-semibold">Confirming your email...</h1>
            <p className="text-center text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Icons.check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold text-green-600 dark:text-green-400">
              Email Confirmed!
            </h1>
            <p className="text-center text-muted-foreground">{message}</p>
            <div className="flex w-full flex-col gap-2 pt-4">
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Icons.close className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
              Confirmation Failed
            </h1>
            <p className="text-center text-muted-foreground">{message}</p>
            <div className="flex w-full flex-col gap-2 pt-4">
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login
              </Button>
              <Button
                onClick={() => router.push("/register")}
                variant="outline"
                className="w-full"
              >
                Register Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
