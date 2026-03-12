import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { LemonsqueezyClient } from "lemonsqueezy.ts";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import { checkIfSubscribed } from "~/shared/hooks/useUserSubscription";
import { z } from "zod";

// Lazy client getter - validates only when actually used (not at build time)
function getLemonSqueezyClient(): LemonsqueezyClient {
  const apiKey = env.LEMON_SQUEEZY_API_KEY;

  if (!apiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Payment system not configured. Please contact support.",
    });
  }

  return new LemonsqueezyClient(apiKey);
}

const createPremiumCheckoutSchema = z.object({
  language: z.enum(["en", "pl"]),
});

const FEASTQR_DASHBOARD_URL =
  process.env.FEASTQR_DASHBOARD_URL || "https://www.feastqr.com/dashboard";
const FEASTQR_YWWW_DASHBOARD_URL =
  process.env.FEASTQR_YWWW_DASHBOARD_URL ||
  "https://ywww.feastqr.com/dashboard";

const checkoutTranslations: Record<"en" | "pl", LemonsqueezyProductOptions> = {
  en: {
    description: "Display QR menus to your clients.",
    name: "FeastQR Menu",
    receipt_button_text: "Go to FeastQR",
    receipt_link_url: FEASTQR_YWWW_DASHBOARD_URL,
    receipt_thank_you_note: "Thank you for your purchase!",
    redirect_url: FEASTQR_DASHBOARD_URL,
  },
  pl: {
    description: "Wyświetlaj menu QR Twoim klientom.",
    name: "FeastQR Menu",
    receipt_button_text: "Przejdź do FeastQR",
    receipt_link_url: FEASTQR_DASHBOARD_URL,
    receipt_thank_you_note: "Dziękujemy za zakup!",
    redirect_url: FEASTQR_DASHBOARD_URL,
  },
};

export const paymentsRouter = createTRPCRouter({
  createPremiumCheckout: privateProcedure
    .input(createPremiumCheckoutSchema)
    .mutation(async ({ ctx, input }) => {
      const language = input.language;
      const translations = checkoutTranslations[language];
      
      // Validate required Lemon Squeezy configuration
      const storeId = env.LEMON_SQUEEZY_STORE_ID;
      const variantId = env.LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID;
      
      if (!storeId || !variantId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment system not configured. Please contact support.",
        });
      }
      
      const newCheckout = await getLemonSqueezyClient().createCheckout({
        checkout_data: {
          custom: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            userId: ctx.user.id,
          },
          name: ctx.user.email || "",
          email: ctx.user.email || "",
        },
        checkout_options: {
          embed: true,
        },

        store: storeId,
        variant: variantId,
        product_options: translations,
      });

      return newCheckout.data.attributes.url;
    }),
  cancelSubscription: privateProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.subscriptions.findFirst({
      where: {
        profileId: ctx.user.id,
      },
    });

    if (!subscription || subscription.status !== "active") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Subscription not found or not active",
      });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const updateResult = await getLemonSqueezyClient().updateSubscription({
      id: subscription.lemonSqueezyId,
      cancelled: true,
    });

    const didCancelSuccessfully =
      updateResult.data.attributes.cancelled === true;

    if (!didCancelSuccessfully) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to cancel subscription",
      });
    }
  }),
  getSubscriptionInfo: privateProcedure.query(async ({ ctx }) => {
    return ctx.db.subscriptions.findFirst({
      where: {
        profileId: ctx.user.id,
      },
      select: {
        endsAt: true,
        renewsAt: true,
        status: true,
        updatePaymentUrl: true,
      },
    });
  }),
  getCustomerPortalUrl: privateProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.subscriptions.findFirst({
      where: {
        profileId: ctx.user.id,
      },
    });

    const isSubscribed = checkIfSubscribed(subscription?.status);

    if (!subscription || !isSubscribed) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Subscription not found or not active",
      });
    }

    const subscriptionResult = await getLemonSqueezyClient().retrieveSubscription({
      id: subscription.lemonSqueezyId,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return subscriptionResult.data.attributes.urls.customer_portal as string;
  }),
});

interface LemonsqueezyProductOptions {
  /**
   * A custom description for the product
   */
  description: string;
  /**
   * An array of variant IDs to enable for this checkout. If this is empty, all variants will be enabled
   */
  enabled_variants?: Array<string>;
  /**
   * An array of image URLs to use as the product's media
   */
  media?: Array<string>;
  /**
   * A custom name for the product
   */
  name: string;
  /**
   * A custom text to use for the order receipt email button
   */
  receipt_button_text: string;
  /**
   * A custom URL to use for the order receipt email button
   */
  receipt_link_url: string;
  /**
   * A custom thank you note to use for the order receipt email
   */
  receipt_thank_you_note: string;
  /**
   * A custom URL to redirect to after a successful purchase
   */
  redirect_url: string;
}
