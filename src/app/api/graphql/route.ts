import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { isUserAuthenticated } from "@/auth";
import {
  createPoll,
  createUser,
  createVote,
  fetchPoll,
  fetchPolls,
  fetchUser,
  fetchPollsForUser,
  fetchVotesForPoll,
  fetchVotesForUser,
  isValidAnswer,
  fetchVote,
} from "@/app/api/ddb";

// Type Definitions
const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    generation: String
    gender: String
    image: String
    polls: [Poll!]
    votes: [Vote!]
  }

  type Poll {
    id: ID!
    userId: ID!
    user: User!
    title: String!
    answers: [String!]!
    description: String
    createdAt: Float
    votes: [Vote!]

    # Results
    totalVotesCount: Int
    answer1Count: Int
    answer2Count: Int
    answer3Count: Int
    answer4Count: Int
    answer1MaleCount: Int
    answer2MaleCount: Int
    answer3MaleCount: Int
    answer4MaleCount: Int
    answer1FemaleCount: Int
    answer2FemaleCount: Int
    answer3FemaleCount: Int
    answer4FemaleCount: Int
  }

  type Vote {
    pollId: ID!
    userId: ID!
    answer: String!
  }

  type Query {
    user(id: ID!): User
    vote(pollId: ID!, userId: ID!): Vote
    polls: [Poll!]
    poll(id: ID!): Poll
  }

  type Mutation {
    createUser(id: ID!, name: String!, generation: String, gender: String, image: String): User
    createPoll(userId: ID!, title: String!, answers: [String!]!, description: String): Poll
    createVote(userId: ID!, pollId: ID!, answer: String!): Vote
  }
`;

type Context = {
  accessToken: string | null;
};

// Context
const context = async (request: Request): Promise<Context> => {
  const accessToken = request.headers.get("accessToken");
  return {
    accessToken,
  };
};

// Updated Resolvers
const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      return await fetchUser(id);
    },
    polls: async () => {
      return await fetchPolls();
    },
    poll: async (_: any, { id }: { id: string }) => {
      return await fetchPoll(id);
    },
    vote: async (_: any, { userId, pollId }: { userId: string, pollId: string }) => {
      return await fetchVote(pollId, userId);
    }
  },
  Mutation: {
    createUser: async (
      _: any,
      { id, name, image, generation, gender }: { id: string; name: string; generation: string, gender: string, image: string },
      { accessToken }: Context
    ) => {
      if (!(await isUserAuthenticated(accessToken))) return null;
      return await createUser({ id, name, image, gender, generation });
    },
    createPoll: async (
      _: any,
      {
        userId,
        title,
        answers,
        description,
      }: { userId: string; title: string; answers: string[]; description: string },
      { accessToken }: Context
    ) => {
      if (!(await isUserAuthenticated(accessToken))) return null;
      return await createPoll(userId, title, answers, description);
    },
    createVote: async (
      _: any,
      { userId, pollId, answer }: { userId: string; pollId: string; answer: string },
      { accessToken }: Context
    ) => {
      if (!(await isUserAuthenticated(accessToken))) return null;
      if (!(await isValidAnswer(pollId, answer))) {
        console.error(`Invalid answer: ${answer}`);
        return null;
      }
      return await createVote(userId, pollId, answer);
    },
  },
  User: {
    polls: async ({ id }: { id: string }) => {
      return await fetchPollsForUser(id);
    },
    votes: async ({ id }: { id: string }) => {
      return await fetchVotesForUser(id);
    },
  },
  Poll: {
    user: async ({ userId }: { userId: string }) => {
      return await fetchUser(userId);
    },
    votes: async ({ id }: { id: string }) => {
      return await fetchVotesForPoll(id);
    },
  },
};

// Apollo Server Setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, { context });

export { handler as GET, handler as POST };
