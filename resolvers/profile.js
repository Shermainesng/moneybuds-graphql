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
          .select("id, username, avatar_url, phone_number")
          .eq("id", args.id)
          .single();

        handleSupabaseError(error);
        // console.log("in profiles", data);

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
    //get array of friends' PROFILES given user ID
    friends: async (_, args) => {
      try {
        const { data: friends, error } = await supabase
          .from("friends")
          .select("id, friend_id")
          .eq("user_id", args.id);

        console.log("friends array", friends);
        //for each friend, get the profile for the friend_id

        const profilesArr = await Promise.all(
          friends.map(async (friend) => {
            const profileData = await profileResolver.Query.profile(_, {
              id: friend.friend_id,
            });
            return profileData;
          })
        );
        console.log("profiles Array", profilesArr);
        return profilesArr;
      } catch (error) {
        throw new Error("Error fetching friends: " + error.message);
      }
    },
    //userId and friendId
    //insert 2 rows in db:
    //userId: userId, friendId: friendId and
    //userId: friendId, friendId: userId
  },
  Mutation: {
    async addFriend(_, args) {
      try {
        const { data: insertedRows, error } = await supabase
          .from("friends")
          .insert([
            { userId: args.input.user_id, friendId: args.input.friend_id },
            { userId: args.input.friend_id, friendId: args.input.user_id },
          ]);

        handleSupabaseError(expenseError);

        return insertedRows;
      } catch (err) {
        console.error("Error adding friends:", error.message);
      }
    },
  },
};
