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
        created_by:Profile! 
    }
    type GroupMember {
        id: ID!
        group_id: Group!
        user_id: Profile!
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
      friends(id: ID!): [Profile]
      expense(id: ID!): Expense!
      group(id: ID!): Group!
    #   expenseMembersByUserId(id:ID!): [ExpenseMember]
    #   expenseMembersByUserId(id: ID!): [String!]!
    #   expenseMembersByExpenseId(expense_id:ID!): [ExpenseMember]
        # expenseMembersByExpenseIds(expense_ids:[ID], user_id: ID): [ExpenseMember]
        expenseMembersByExpenseIds(user_id: ID): [ExpenseMember]
    }
    type Mutation {
        addFriend(input: AddFriendInput): Boolean!
        addExpense(input: ExpenseInput!): Expense
        addExpenseMember(input: [ExpenseMemberInput]): [ExpenseMember] 
        addGroup(input: AddGroupInput): Group
    }
    input AddFriendInput {
        user_id: ID!
        friend_id: ID!
        status: String
    }
    input ExpenseInput {
        group_id: ID
        payer_id: ID!
        amount: Int!
        description: String
        date: String
    }
    input AddGroupInput {
        name: String
        created_by: ID
    }
    input ExpenseMemberInput {
        # when defining input types, we specify scalar types like ID, string, Int instead of complex object types
        expense_id: ID! 
        member_id: ID! 
        isOwed: Int!
        owes: Int!
    }
`;
