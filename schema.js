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
        amount: Float!
        description: String
        date: String
        created_at: String
    }
    type ExpenseMember {
        id: ID!
        expense_id: Expense!
        member_id: Profile!
        isOwed: Float!
        owes: Float!
    }
    type Query {
      profile(id:ID!): Profile!
      profiles: [Profile!]
      friends(id: ID!): [Profile]
      expense(id: ID!): Expense!
      group(id: ID!): Group!
      groups(userId:ID!): [Group]
      groupMembers(groupId: ID!): [Profile]
      expenseMembersByExpenseIds(userId: ID, expenseId: ID): [ExpenseMember]
      expenseMembersByGroupIds(groupId: ID, userId: ID): [ExpenseMember]
      expenseDetailsByExpenseMemberId(expenseMemberId: ID): Expense
    }
    type Mutation {
        addFriend(input: AddFriendInput): Boolean!
        addExpense(input: ExpenseInput!): Expense
        addExpenseMember(input: [ExpenseMemberInput]): [ExpenseMember] 
        addGroup(input: AddGroupInput): Group
        addGroupMember(input: AddGroupMembersInput) :[GroupMember]
    }
    input AddFriendInput {
        user_id: ID!
        friend_id: ID!
        status: String
    }
    input ExpenseInput {
        group_id: ID
        payer_id: ID!
        amount: Float!
        description: String
        date: String
    }
    input AddGroupInput {
        name: String
        created_by: ID
    }
    input AddGroupMembersInput {
        userIds: [ID]
        group_id: ID!
    }
    input ExpenseMemberInput {
        # when defining input types, we specify scalar types like ID, string, Int instead of complex object types
        expense_id: ID! 
        member_id: ID! 
        isOwed: Float!
        owes: Float!
    }
`;
