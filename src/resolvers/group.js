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
      console.log("in get group", args.id);
      try {
        const { data: group, error: groupError } = await supabase
          .from("groups")
          .select("id, name, created_by")
          .eq("id", args.id)
          .single();

        const groupWithProfile = await getProfile(_, group);
        // console.log(groupWithProfile);
        handleSupabaseError(groupError);
        return groupWithProfile;
      } catch (err) {
        throw new Error("Error fetching expense: " + err.message);
      }
    },
    //given user_id, get array of group_ids where user is a part of, then get group rows
    groups: async (_, args) => {
      let groupIDs;
      try {
        const { data: groupMemberRows, error: groupMemberRowsError } =
          await supabase
            .from("group_members")
            .select("group_id")
            .eq("user_id", args.userId);

        groupIDs = groupMemberRows.map((row) => row.group_id.toString());
        handleSupabaseError(groupMemberRowsError);
      } catch (error) {
        throw new Error(
          "Error fetching groupIDs from group members: " + err.message
        );
      }

      try {
        const { data: groups, error: groupsError } = await supabase
          .from("groups")
          .select("id, name")
          .in("id", groupIDs);

        console.log("got groups", groups);
        handleSupabaseError(groupsError);
        return groups;
      } catch (error) {
        throw new Error("Error fetching groups: " + error.message);
      }
    },
    groupMembers: async (_, args) => {
      console.log("reached groupMembers", args.groupId);
      try {
        const { data: groupMembers, error: groupMembersError } = await supabase
          .from("group_members")
          .select("user_id")
          .eq("group_id", args.groupId);

        handleSupabaseError(groupMembersError);
        console.log(groupMembers);

        const promises = groupMembers.map(async (member) => {
          const profileData = await profileResolver.Query.profile(_, {
            id: member.user_id,
          });
          return profileData;
        });

        const groupMembersProfiles = await Promise.all(promises);
        console.log(groupMembersProfiles);
        return groupMembersProfiles;
      } catch (error) {
        throw new Error("Error fetching group members: " + error.message);
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
        handleSupabaseError(error);
        return newGroupWithProfile;
      } catch (error) {
        throw new Error("Error adding expense: " + error.message);
      }
    },
    async addGroupMember(_, args) {
      console.log("reached addGroupMember", args);
      try {
        const groupMembers = [];
        for (const userId of args.input.userIds) {
          let groupMember;
          groupMember = {
            group_id: parseInt(args.input.group_id),
            user_id: userId,
          };
          groupMembers.push(groupMember);
        }
        console.log("group members for insert", groupMembers);

        const { data, error } = await supabase
          .from("group_members")
          .insert(groupMembers)
          .select();

        console.log("add group members", data);
        //mapping
      } catch (error) {
        throw new Error("Error adding group members: " + error.message);
      }
    },
  },
};
