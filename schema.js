export const typeDefs = `#graphql
     type Profile {
      id: ID!
      username: String!
      avatar_url: String
      phone_number: String
    }
    type Friend {
        id: ID!
        user_id: Profile!
        friend_id: Profile!
        status: String
    }
    type Group {
        id: ID!
        name: String!
        isGroup: Boolean!
    }
    type Expense {
        id: ID
        group_id: Group
        payer_id: Profile!
        amount: Int!
        description: String
        date: String
    }
    type ExpenseMember {
        id: ID!
        expense_id: Expense!
        member_id: Profile!
        isOwed: Int!
        owes: Int!
    }
    type Query {
      profile(id:ID!): Profile!
      profiles: [Profile!]
      expense(id: ID!): Expense!
    }
    type Mutation {
        addExpense(input: ExpenseInput!): Expense
        addExpenseMember(input: [ExpenseMemberInput]): [ExpenseMember] 
    }
    input ExpenseInput {
        group_id: ID
        payer_id: ID!
        amount: Int!
        description: String
        date: String
    }
    input ExpenseMemberInput {
        # when defining input types, we specify scalar types like ID, string, Int instead of complex object types
        expense_id: ID! 
        member_id: ID! 
        isOwed: Int!
        owes: Int!
    }
`;
