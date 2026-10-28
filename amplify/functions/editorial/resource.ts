import { defineFunction } from "@aws-amplify/backend";

export const editorial = defineFunction({
  name: "editorial",
  entry: "./handler.ts",
  timeoutSeconds: 15,
  resourceGroupName: "data",
});
