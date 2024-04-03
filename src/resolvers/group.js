import { supabase } from "../../supabase.js";
import { handleSupabaseError } from "./shared.js";
import { profileResolver } from "./profile.js";

const getProfile = async (_, group) => {
  try {
    //get profile
    // console.log("in getProfile", group.created_by);
    const payerProfile = await profileResolver.Query.profile(_, {
      id: group.created_by,
    });
    // console.log("in get profile", payerProfile);
    //map profile to group object
    group.created_by = {
      id: payerProfile.id,
      username: payerProfile.username,
    };
    return group;
  } catch (err) {
    throw new Error("Error fetching profile: " + err.message);
  }
};

export const groupResolver = {
  Query: {
    group: async (_, args) => {
      try {
        const { data: group, error: groupError } = await supabase
          .from("groups")
          .select("id, name, created_by")
          .eq("id", args.id)
          .single();

        const groupWithProfile = await getProfile(_, group);
        console.log(groupWithProfile);
        handleSupabaseError(groupError);
        return groupWithProfile;
      } catch (err) {
        throw new Error("Error fetching expense: " + err.message);
      }
    },
  },
  Mutation: {
    async addGroup(_, args) {
      console.log("reached add group!");
      try {
        const { data, error } = await supabase
          .from("groups")
          .insert(args.input)
          .select();

        const newGroup = data[0];
        const newGroupWithProfile = await getProfile(_, newGroup);
        // const payerProfile = await profileResolver.Query.profile(_, {
        //   id: newGroup.created_by,
        // });
        // newGroup.created_by = {
        //   id: payerProfile.id,
        //   username: payerProfile.username,
        // };
        handleSupabaseError(error);
        return newGroupWithProfile;
      } catch (error) {
        throw new Error("Error adding expense: " + error.message);
      }
    },
  },
};
