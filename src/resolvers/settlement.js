import { supabase } from "../../supabase.js";
import { handleSupabaseError } from "./shared.js";
import { profileResolver } from "./profile.js";

const getProfile = async (_, settlement) => {
  console.log("settlement payerid", settlement.payer_id);
  try {
    const payerProfile = await profileResolver.Query.profile(_, {
      id: settlement.payer_id,
    });
    const recipientProfile = await profileResolver.Query.profile(_, {
      id: settlement.recipient_id,
    });

    console.log("got payer in getSettlement", payerProfile);
    //map profile to settlement object
    settlement.payer_id = {
      id: payerProfile.id,
      username: payerProfile.username,
    };
    settlement.recipient_id = {
      id: recipientProfile.id,
      username: recipientProfile.username,
    };
    return settlement;
  } catch (err) {
    throw new Error("Error fetching profile: " + err.message);
  }
};
export const settlementResolver = {
  Query: {
    settlement: async (_, args) => {
      //   console.log("reached settlements", args.id);
      try {
        const { data: settlement, error: expenseError } = await supabase
          .from("settlement")
          .select("id, payer_id,recipient_id, amount")
          .eq("id", args.id)
          .single();
        handleSupabaseError(expenseError);

        const settlementWithProfiles = await getProfile(_, settlement);
        return settlementWithProfiles;
      } catch (err) {
        throw new Error("Error fetching settlement: " + err.message);
      }
    },
    settlements: async (_, args) => {
      try {
        const { data: settlements, error } = await supabase
          .from("settlement")
          .select("id, payer_id,recipient_id, amount")
          .or(`payer_id.eq.${args.userId}, recipient_id.eq.${args.userId}`);

        handleSupabaseError(error);
        const promises = settlements.map(async (settlement) => {
          return await getProfile(_, settlement);
        });
        const settlementWithProfiles = await Promise.all(promises);
        console.log("settlements", settlementWithProfiles);
        return settlementWithProfiles;
      } catch (err) {
        throw new Error("Error fetching profiles: " + err.message);
      }
    },
  },
};

// const promises = expenseMembersData.map(async (expenseMemberRow) => {
//     const payerProfile = await profileResolver.Query.profile(_, {
//       id: expenseMemberRow.member_id,
//     });
//     expenseMemberRow.member_id = payerProfile;
//     const expense = await expenseResolver.Query.expense(_, {
//       id: expenseMemberRow.expense_id,
//     });
//     expenseMemberRow.expense_id = expense;
//     return expenseMemberRow; // Return the updated object
//   });

//   // Wait for all Promises to resolve
//   const updatedExpenseMembersData = await Promise.all(promises);
