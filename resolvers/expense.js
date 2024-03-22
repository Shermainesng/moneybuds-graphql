import { supabase } from "../supabase.js";
import { handleSupabaseError } from "./shared.js";
import { profileResolver } from "./profile.js";
export const expenseResolver = {
  Query: {
    expense: async (_, args) => {
      // console.log("reached expense", args.id);
      try {
        const { data: expenseData, error: expenseError } = await supabase
          .from("expenses")
          .select("id, payer_id, amount, description")
          .eq("id", args.id)
          .single();
        // console.log("got expense", data);
        handleSupabaseError(expenseError);

        //fetch associated profile data for the payer_id
        const payerProfile = await profileResolver.Query.profile(_, {
          id: expenseData.payer_id,
        });

        console.log("profile Data", payerProfile);

        const result = {
          ...expenseData,
          payer_id: payerProfile,
        };
        console.log(result);

        return result;
      } catch (error) {
        throw new Error("Error fetching expense: " + error.message);
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

        console.log(data[0]);
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
