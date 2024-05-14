import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { createSchema } from "graphql-yoga";
// import { createClient } from "@supabase/supabase-js";
import { typeDefs } from "./schema.js";
//import resolvers
import { mergeResolvers } from "@graphql-tools/merge";
import { profileResolver } from "./src/resolvers/profile.js";
import { expenseResolver } from "./src/resolvers/expense.js";
import { groupResolver } from "./src/resolvers/group.js";
import { settlementResolver } from "./src/resolvers/settlement.js";

// const supabase = createClient(
//   "https://jecatujziyybwubikulz.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY2F0dWp6aXl5Ynd1YmlrdWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNDY4MjksImV4cCI6MjAyMzYyMjgyOX0._Hz16c-LDmguqHINmks8paG7RvPBlXUs_VFOG6h-wCg"
// );

const resolvers = mergeResolvers([
  profileResolver,
  expenseResolver,
  groupResolver,
  settlementResolver,
]);

export const schema = createSchema({
  typeDefs,
  // resolvers: {
  //   ...profileResolver,
  //   ...expenseResolver,
  // },
  resolvers: resolvers,
  // mergeResolvers([profileResolver, expenseResolver, groupResolver, settlementResolver]),
});

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema });

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://192.168.1.87:4000/graphql");
});
