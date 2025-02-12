import { useEffect, useState } from "react";
import { fetchGraphQL } from "../util";

export type Vote = {
    userId: string;
    pollId: string;
    answer: string;
}

export function useVote(userId: string, pollId: string) {
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
            const data = await fetchGraphQL(query, { userId, pollId });
            setVote(data.vote);
        };

        if (!userId && !pollId) fetchVote();
    }, [userId, pollId]);

    return { vote, setVote };
}
