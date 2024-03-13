import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { createSchema } from "graphql-yoga";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jecatujziyybwubikulz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY2F0dWp6aXl5Ynd1YmlrdWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwNDY4MjksImV4cCI6MjAyMzYyMjgyOX0._Hz16c-LDmguqHINmks8paG7RvPBlXUs_VFOG6h-wCg"
);

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Profile {
      id: ID!
      username: String!
    }
    type Query {
      profiles: [Profile!]
    }
  `,
  resolvers: {
    Query: {
      profiles: async () => {
        // Fetch users from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username");

        if (error) {
          throw new Error(error.message);
        }

        return data;
      },
    },
  },
});

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema });

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://192.168.1.87:4000/graphql");
});
