import { defineStorage } from "@aws-amplify/backend";

/**
 * Media attached to testimonies (images, audio, video).
 *
 * uploads/  participants (guests) can write here but never read or list, so
 *           nobody can see another person's files. Objects expire after a day
 *           (see backend.ts) unless a submission claims them.
 * media/    where submitTestimony moves accepted files, per testimony.
 *           Only editors can read or delete them.
 */
export const storage = defineStorage({
  name: "harfMedia",
  access: (allow) => ({
    "uploads/*": [allow.guest.to(["write"])],
    "media/*": [allow.groups(["ADMINS"]).to(["read", "delete"])],
  }),
});
