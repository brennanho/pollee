import { useEffect, useState } from "react";
import { fetchGraphQL } from "../util";
import { Vote } from "../types";

export function useVote(pollId: string | undefined, userId: string | undefined) {
  const [vote, setVote] = useState<Vote | null>(null);

  useEffect(() => {
    const fetchVote = async () => {
      const query = `
        query GetVote($pollId: ID!, $userId: ID!) {
          vote(pollId: $pollId, userId: $userId) {
            userId
            pollId
            answer
          }
        }
      `;
      const data = await fetchGraphQL(query, { pollId, userId });
      setVote(data.vote);
    };
    if (userId && pollId) fetchVote();
  }, [userId, pollId]);

  return { vote, setVote };
}
