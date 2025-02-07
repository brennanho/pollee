"use client";

import React, { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PollCard } from "./components/PollCard";
import { CreatePollModal } from "./components/CreatePollModal";
import { fetchGraphQL } from "./util";
import { AppContext } from "./appshell";

export default function Page() {
  const { data: session } = useSession();
  const { user } = useContext(AppContext);
  const [polls, setPolls] = useState<any>(null);

  const handlePollSubmit = async (poll: any) => {
    const query = `
      mutation CreatePoll($userId: ID!, $title: String!, $answers: [String!]!, $description: String) {
        createPoll(userId: $userId, title: $title, answers: $answers, description: $description) {
          id
          title
          answers
          description
        }
      }
    `;
    await fetchGraphQL(
      query,
      {
        userId: user.id,
        title: poll.title,
        answers: poll.answers,
        description: poll.description,
      },
      session?.accessToken
    );

    await fetchPolls();
  };

  const fetchPolls = async () => {
    const query = `
      query GetPolls {
        polls {
          id
          title
          answers
          description
          createdAt
          user {
            id
            name
            image
          }
          votes {
            userId
            answer
          }
        }
      }
    `;
    const data = await fetchGraphQL(query);
    setPolls(data.polls);
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div>
      {polls?.map((poll: any) => {
        return <PollCard poll={poll} voter={user} key={poll.id} />;
      })}
      <CreatePollModal onSubmit={handlePollSubmit} />
    </div>
  );
}
