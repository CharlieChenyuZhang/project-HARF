import { defineFunction } from "@aws-amplify/backend";

/** Guest requests that don't create a testimony: six-month revisits, withdrawals, usage events and community counts. */
export const participant = defineFunction({
  name: "participant",
  entry: "./handler.ts",
  timeoutSeconds: 10,
  resourceGroupName: "data",
});
