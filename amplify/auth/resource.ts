import { defineAuth } from "@aws-amplify/backend";

/**
 * Cognito is used only by HARF editors. Participants never sign in: they
 * submit as unauthenticated guests through the identity pool. Self sign-up is
 * disabled in backend.ts, so editor accounts are created by an administrator.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["ADMINS"],
});
