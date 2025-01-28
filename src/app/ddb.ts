import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";

export const DDB = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});
const POLLEE_USERS_TABLE_NAME = "Pollee-Users";
const POLLEE_POLLS_DDB_TABLE_NAME = "Pollee-Polls";
const POLLEE_VOTES_DDB_TABLE_NAME = "Pollee-Votes";

type User = {
  id: string;
  name: string;
}

type Poll = {
  id: string;
  userId: string;
  title: string;
  answers: string[];
  description: string;
}

type Vote = {
  userId: string;
  pollId: string;
  answer: string;
}

export async function fetchUser(id: string): Promise<User | null> {
  const params = {
    TableName: POLLEE_USERS_TABLE_NAME,
    Key: { id },
  };
  try {
    const result = await DDB.get(params).promise();
    return result.Item as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function fetchPolls(): Promise<Poll[] | null> {
  const params = { TableName: POLLEE_POLLS_DDB_TABLE_NAME };
  try {
    const result = await DDB.scan(params).promise();
    return result.Items as Poll[];
  } catch (error) {
    console.error("Error fetching polls:", error);
    return [];
  }
}

export async function fetchPoll(id: string): Promise<Poll | null> {
  const params = {
    TableName: POLLEE_POLLS_DDB_TABLE_NAME,
    Key: { id },
  };
  try {
    const result = await DDB.get(params).promise();
    return result.Item as Poll;
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
}

export async function createUser(id: string, name: string, age: number) {
  const params = {
    TableName: POLLEE_USERS_TABLE_NAME,
    Item: { id, name, age },
  };
  try {
    await DDB.put(params).promise();
    return params.Item;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function createPoll(userId: string, title: string, answers: string[], description: string) {
  const id = uuid();
  const params = {
    TableName: POLLEE_POLLS_DDB_TABLE_NAME,
    Item: { id, userId, title, answers, description },
  };
  try {
    await DDB.put(params).promise();
    return params.Item;
  } catch (error) {
    console.error("Error creating poll:", error);
    return null;
  }
}

export async function createVote(userId: string, pollId: string, answer: string) {
  const params = {
    TableName: POLLEE_VOTES_DDB_TABLE_NAME,
    Item: { userId, pollId, answer },
  };
  try {
    await DDB.put(params).promise();
    return params.Item;
  } catch (error) {
    console.error("Error creating vote:", error);
    return null;
  }
}

export async function fetchPollsForUser(userId: string): Promise<Poll[] | null> {
  const params = {
    TableName: POLLEE_POLLS_DDB_TABLE_NAME,
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": userId },
  };
  try {
    const result = await DDB.scan(params).promise();
    return result.Items as Poll[];
  } catch (error) {
    console.error("Error fetching polls for user:", error);
    return [];
  }
}

export async function fetchVotesForUser(userId: string): Promise<Vote[] | null> {
  const params = {
    TableName: POLLEE_VOTES_DDB_TABLE_NAME,
    IndexName: "userId-pollId-index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": userId },
  };
  try {
    const result = await DDB.query(params).promise();
    return result.Items as Vote[];
  } catch (error) {
    console.error("Error fetching votes for user:", error);
    return [];
  }
}

export async function fetchVotesForPoll(pollId: string): Promise<Vote[] | null> {
  const params = {
    TableName: POLLEE_VOTES_DDB_TABLE_NAME,
    KeyConditionExpression: "pollId = :pollId",
    ExpressionAttributeValues: { ":pollId": pollId },
  };
  try {
    const result = await DDB.query(params).promise();
    return result.Items as Vote[];
  } catch (error) {
    console.error("Error fetching votes for poll:", error);
    return [];
  }
}

export async function isValidAnswer(pollId: string, answer: string): Promise<boolean> {
  try {
    const pollParams = {
      TableName: POLLEE_POLLS_DDB_TABLE_NAME,
      Key: { id: pollId },
    };
    const pollResult = await DDB.get(pollParams).promise();

    if (!pollResult.Item) {
      console.error(`Poll with ID "${pollId}" does not exist.`);
      return false;
    }

    const validAnswers = pollResult.Item.answers;
    return validAnswers.includes(answer);
  } catch (error) {
    console.error("Error validating answer:", error);
    return false;
  }
}
