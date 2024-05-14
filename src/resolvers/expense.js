import { supabase } from "../../supabase.js";
import { handleSupabaseError } from "./shared.js";
import { profileResolver } from "./profile.js";
import { groupResolver } from "./group.js";

export const expenseResolver = {
  Query: {
    expense: async (_, args) => {
      // console.log("reached expense", args.id);
      try {
        const { data: expenseData, error: expenseError } = await supabase
          .from("expenses")
          .select("id, payer_id,group_id, amount, description")
          .eq("id", args.id)
          .single();
        // console.log("got expense", data);
        handleSupabaseError(expenseError);

        //fetch associated profile data for the payer_id
        const payerProfile = await profileResolver.Query.profile(_, {
          id: expenseData.payer_id,
        });

        //fetch associated group data (if not null) for the expense
        let groupObject = null;
        if (expenseData.group_id !== null) {
          groupObject = await groupResolver.Query.group(_, {
            id: expenseData.group_id,
          });
        }
        // console.log("profile Data", payerProfile);

        const result = {
          ...expenseData,
          payer_id: payerProfile,
          group_id: groupObject,
        };
        // console.log(result);

        return result;
      } catch (error) {
        throw new Error("Error fetching expense: " + error.message);
      }
    },
    expenseMembersByGroupIds: async (_, args) => {
      console.log("in group", args.groupId);
      console.log("in group", args.userId);
      let expenseIDs;
      try {
        const { data: expenseRows, error: expenseError } = await supabase
          .from("expenses")
          .select("id")
          .eq("group_id", args.groupId);

        expenseIDs = expenseRows.map((row) => row.id);
        console.log("got expense IDs from the same group", expenseIDs);
        handleSupabaseError(expenseError);
      } catch (error) {
        throw new Error("Error fetching expense IDs: " + error.message);
      }

      //take array of expense IDs belonging to the same group and return expense members
      try {
        const { data: expenseMembersData, error: expenseError } = await supabase
          .from("expense_members")
          .select("id, member_id, expense_id, isOwed, owes")
          .in("expense_id", expenseIDs);

        // console.log("got expense", expenseMembersData);
        handleSupabaseError(expenseError);

        const promises = expenseMembersData.map(async (expenseMemberRow) => {
          const payerProfile = await profileResolver.Query.profile(_, {
            id: expenseMemberRow.member_id,
          });
          expenseMemberRow.member_id = payerProfile;
          const expense = await expenseResolver.Query.expense(_, {
            id: expenseMemberRow.expense_id,
          });
          expenseMemberRow.expense_id = expense;
          return expenseMemberRow; // Return the updated object
        });

        // Wait for all Promises to resolve
        const updatedExpenseMembersData = await Promise.all(promises);

        console.log(
          "got expense members by group id",
          updatedExpenseMembersData
        );
        return updatedExpenseMembersData;
      } catch (error) {
        throw new Error("Error fetching expense: " + error.message);
      }
    },
    //get expenses where user is a part of, then return all the recorded expense members
    expenseMembersByExpenseIds: async (_, args) => {
      let expenseIDs;
      console.log("in method userID", args.userId);
      console.log("in method expenseID", args.expenseId);
      //given user ID, get array of expense IDs that user is part of
      if (args.userId !== null && args.expenseId === null) {
        try {
          const { data: expenseRows, error: expenseError } = await supabase
            .from("expense_members")
            .select("expense_id")
            .eq("member_id", args.userId);

          expenseIDs = expenseRows.map((row) => row.expense_id.toString());
          handleSupabaseError(expenseError);
        } catch (error) {
          throw new Error("Error fetching expense IDs: " + error.message);
        }
      } else {
        expenseIDs = [args.expenseId];
      }

      try {
        const { data: expenseMembersData, error: expenseError } = await supabase
          .from("expense_members")
          .select("id, member_id, expense_id, isOwed, owes")
          .in("expense_id", expenseIDs);

        // console.log("got expense", expenseMembersData);
        handleSupabaseError(expenseError);

        const promises = expenseMembersData.map(async (expenseMemberRow) => {
          const payerProfile = await profileResolver.Query.profile(_, {
            id: expenseMemberRow.member_id,
          });
          expenseMemberRow.member_id = payerProfile;
          const expense = await expenseResolver.Query.expense(_, {
            id: expenseMemberRow.expense_id,
          });
          expenseMemberRow.expense_id = expense;
          return expenseMemberRow; // Return the updated object
        });

        // Wait for all Promises to resolve
        const updatedExpenseMembersData = await Promise.all(promises);

        console.log("results:", updatedExpenseMembersData);
        return updatedExpenseMembersData;
      } catch (error) {
        throw new Error("Error fetching expense: " + error.message);
      }
    },
    //expenseMemberID => Expense
    expenseDetailsByExpenseMemberId: async (_, args) => {
      //get expense ID
      console.log("expense mem id", args.expenseMemberId);
      try {
        const { data: result, error: expenseIdError } = await supabase
          .from("expense_members")
          .select("expense_id")
          .eq("id", parseInt(args.expenseMemberId));

        console.log("got expense id", result[0].expense_id);
        const expenseId = result[0].expense_id;
        handleSupabaseError(expenseIdError);

        try {
          const { data: expenseDetails, error: expenseDetailError } =
            await supabase
              .from("expenses")
              .select("id, created_at, payer_id, amount, description, date")
              .eq("id", expenseId);

          console.log("Got expense details", expenseDetails);
          handleSupabaseError(expenseDetailError);

          const payerProfile = await profileResolver.Query.profile(_, {
            id: expenseDetails[0].payer_id,
          });

          const result = {
            ...expenseDetails[0],
            payer_id: payerProfile,
          };
          // console.log(result);
          return result;
        } catch (err) {
          throw new Error("Error fetching expense details: " + err.message);
        }
      } catch (error) {
        throw new Error("Error fetching expense ID: " + error.message);
      }
    },
  },
  Mutation: {
    async addExpense(_, args) {
      console.log("reached addexpense");
      try {
        const { data, error } = await supabase
          .from("expenses")
          .insert(args.input)
          .select();
        const expense = data[0];
        //get the profile object
        const payerProfile = await profileResolver.Query.profile(_, {
          id: expense.payer_id,
        });
        //map the profile object to the data i got back
        expense.payer_id = {
          id: payerProfile.id,
          username: payerProfile.username,
        };
        handleSupabaseError(error);
        return expense;
      } catch (error) {
        throw new Error("Error adding expense: " + error.message);
      }
    },
    async addExpenseMember(_, args) {
      console.log("reached addexpense member");
      try {
        const expenseMembers = [];

        for (const input of args.input) {
          //get profile and expense objects
          var profileData = await profileResolver.Query.profile(_, {
            id: input.member_id,
          });
          var expenseData = await expenseResolver.Query.expense(_, {
            id: input.expense_id,
          });
          const expenseMember = {
            expense_id: expenseData.id,
            member_id: profileData.id,
            isOwed: input.isOwed,
            owes: input.owes,
          };

          expenseMembers.push(expenseMember);
        }

        const { data, error } = await supabase
          .from("expense_members")
          .insert(expenseMembers)
          .select();
        //map the profile object to the data i got back - specify the fields i want
        data.map((expense) => {
          expense.member_id = {
            id: profileData.id,
          };
          expense.expense_id = {
            id: expenseData.id,
          };
        });

        handleSupabaseError(error);
        return data;
      } catch (error) {
        throw new Error("Error adding expense: " + error.message);
      }
    },
  },
};

//get expense members for transactions belonging in that group
//1) from expenses table, get expense_ids where group=6 => expenseIds: [723]
//2) in expense members table, get rows where expense_id = value in expenseIds
