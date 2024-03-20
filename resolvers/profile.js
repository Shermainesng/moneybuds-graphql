import { supabase } from "../supabase.js";
import { handleSupabaseError } from "./shared.js";

export const profileResolver = {
  //resolvers for entrypoint into the graph
  Query: {
    profile: async (_, args) => {
      // console.log("in profile", args.id);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("id", args.id)
          .single();

        handleSupabaseError(error);

        return data;
      } catch (error) {
        throw new Error("Error fetching profile: " + error.message);
      }
    },
    profiles: async () => {
      try {
        // Fetch users from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username");

        handleSupabaseError(error);
        return data;
      } catch (error) {
        throw new Error("Error fetching profiles: " + error.message);
      }
    },
    //given a userID, get all the friend IDs
    //for each friend IDs, get the profiles of each friend
  },
};
