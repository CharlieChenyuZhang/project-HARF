import { defineFunction } from "@aws-amplify/backend";

export const submitTestimony = defineFunction({
  name: "submit-testimony",
  entry: "./handler.ts",
  timeoutSeconds: 15,
  // Lives in the data stack because it is both a resolver and a table writer.
  resourceGroupName: "data",
});
