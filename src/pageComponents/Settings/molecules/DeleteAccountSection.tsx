"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { Icons } from "~/components/Icons";
import { supabase } from "~/server/supabase/supabaseClient";

const deleteAccountSchema = z.object({
  confirmEmail: z.string().email("Please enter a valid email address"),
});

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export function DeleteAccountSection() {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: user } = api.auth.getProfile.useQuery();

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmEmail: "",
    },
  });

  const deleteAccountMutation = api.user.deleteAccount.useMutation({
    onSuccess: async () => {
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
        variant: "default",
      });

      // Sign out and redirect to home
      await supabase().auth.signOut();
      router.push("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeleteAccountFormValues) => {
    deleteAccountMutation.mutate(data);
  };

  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-destructive">
            Delete Account
          </h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              <Icons.trash className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This action <strong>cannot be undone</strong>. This will permanently delete your account and remove all your data from our servers, including:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Your profile information</li>
                  <li>All your restaurant menus</li>
                  <li>All dishes, categories, and menu items</li>
                  <li>All translations and customizations</li>
                  <li>Any uploaded images</li>
                  <li>Subscription information</li>
                </ul>
                <p className="pt-2">
                  To confirm, please enter your email address:{" "}
                  <strong>{user?.email}</strong>
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                <Input
                  {...form.register("confirmEmail")}
                  type="email"
                  placeholder="Enter your email to confirm"
                  disabled={deleteAccountMutation.isLoading}
                />
                {form.formState.errors.confirmEmail && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmEmail.message}
                  </p>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => form.reset()}
                  disabled={deleteAccountMutation.isLoading}
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  variant="destructive"
                  loading={deleteAccountMutation.isLoading}
                  disabled={deleteAccountMutation.isLoading || !form.watch("confirmEmail")}
                >
                  {deleteAccountMutation.isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account Permanently"
                  )}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
