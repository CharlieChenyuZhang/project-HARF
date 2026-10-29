import { defineFunction } from "@aws-amplify/backend";

/** Guest requests that don't create a testimony: six-month revisits, withdrawals and usage events. */
export const participant = defineFunction({
  name: "participant",
  entry: "./handler.ts",
  timeoutSeconds: 10,
  resourceGroupName: "data",
});
