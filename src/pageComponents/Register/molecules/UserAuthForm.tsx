"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type TFunction } from "i18next";
import { type Provider } from "@supabase/supabase-js";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { FormInput } from "~/components/FormInput/FormInput";
import { Icons } from "~/components/Icons";
import { Button, buttonVariants } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { supabase } from "~/server/supabase/supabaseClient";
import { type ZodReturnType } from "~/utils";
import { cn } from "~/utils/cn";

const registerValidationSchema = (translate: TFunction) =>
  z
    .object({
      email: z.string().email(),
      password: z
        .string()
        .min(8, translate("common.passwordLengthValidation"))
        .regex(/[A-Z]/, translate("common.passwordUppercaseValidation"))
        .regex(/[a-z]/, translate("common.passwordLowercaseValidation"))
        .regex(
          /[^A-Za-z0-9]/,
          translate("common.passwordSpecialCharacterValidation"),
        ),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: translate("common.passwordConfirmationValidation"),
      path: ["passwordConfirmation"],
    });

type RegisterFormValues = ZodReturnType<typeof registerValidationSchema>;

const translations = {
  en: {
    hello: "Hello",
    confirmYourEmailAddress: "Confirm your email address.",
    resetYourEmail: "Reset your email.",
    confirmYourEmailAddressDescription:
      "Please confirm your email address by clicking the button below.",
    resetYourEmailDescription:
      "Click the button below to reset your email address.",
    buttonText: "Continue",
    orCopyAndPaste: "or copy and paste this URL into your browser:",
  },
  pl: {
    hello: "Witaj",
    confirmYourEmailAddress: "Potwierdź swój adres email.",
    resetYourEmail: "Zresetuj Adres Email.",
    confirmYourEmailAddressDescription:
      "Potwierdź swój adres email klikając w przycisk poniżej.",
    buttonText: "Kontynuuj",
    orCopyAndPaste: "lub skopiuj i wklej ten adres URL do przeglądarki:",
  },
};

const signInWithOauth = async (provider: Provider, toast: ReturnType<typeof useToast>["toast"]) => {
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : `${window.location.origin}/dashboard`;
    
  const { error } = await supabase().auth.signInWithOAuth({
    provider: provider,
    options: { redirectTo: redirectUrl },
  });

  if (error) {
    toast({
      title: "OAuth Error",
      description: error.message,
      variant: "destructive",
      duration: 9000,
    });
  }
};

export function UserAuthForm() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerValidationSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`
      : `${window.location.origin}/auth/confirm`;
      
    const { error } = await supabase().auth.signUp({
      ...data,
      options: {
        data: translations[i18n.language as "en" | "pl"],
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      // Handle rate limit error
      if (error.status === 429 || error.message.includes("rate limit")) {
        toast({
          title: t("common.tooManyRequests"),
          description: t("common.rateLimitError"),
          variant: "destructive",
          duration: 9000,
        });

        return;
      }

      // Handle other auth errors
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 9000,
      });

      return;
    }

    toast({
      title: t("register.checkYourEmailForConfirmation"),
      description: t("common.confirmYourEmail"),
      variant: "default",
      duration: 9000,
    });
  };

  return (
    <Form {...form}>
      <form
        className="grid gap-6"
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormInput label={t("common.emailLabel")}>
              <Input {...field} />
            </FormInput>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormInput label={t("common.passwordLabel")}>
              <Input {...field} type="password" />
            </FormInput>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormInput label={t("common.passwordConfirmLabel")}>
              <Input {...field} type="password" />
            </FormInput>
          )}
        />
        <Button loading={form.formState.isSubmitting} type="submit">
          {t("register.submitButton")}
        </Button>
      </form>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }), "flex gap-2")}
        onClick={() => void signInWithOauth("google", toast)}
      >
        <Icons.google width={16} />
        Google
      </button>
    </Form>
  );
}
