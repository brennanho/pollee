"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PollFormModal, PollComp } from "./components/TestComponents";

export default function Poll() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [polls, setPolls] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const fetchGraphQL = async (query: string, variables = {}) => {
    console.log({session});
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // @ts-ignore
        accessToken: session?.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    const { data } = await response.json();
    return data;
  };

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
    await fetchGraphQL(query, {
      userId: user.id,
      title: poll.title,
      answers: poll.answers,
      description: poll.description,
    });

    // Fetch updated polls
    await fetchPolls();
  };

  const handleVote = async (poll: any) => {
    if (!selectedAnswer) {
      alert("Please select an answer before voting.");
      return;
    }
    const query = `
      mutation CreateVote($userId: ID!, $pollId: ID!, $answer: String!) {
        createVote(userId: $userId, pollId: $pollId, answer: $answer) {
          pollId
          userId
          answer
        }
      }
    `;
    await fetchGraphQL(query, {
      userId: user.id,
      pollId: poll.id,
      answer: selectedAnswer,
    });

    // Fetch updated polls
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
          user {
            id
            name
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

  const fetchUser = async () => {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          age
        }
      }
    `;
    const data = await fetchGraphQL(query, { id: session?.user?.email });
    setUser(data.user);
  };

  useEffect(() => {
    async function fetchEverything() {
      await fetchUser();
      await fetchPolls();
    }
    if (session?.user) {
      fetchEverything();
    }
  }, [session?.user]);

  return (
    <div>
      <h1>User</h1>
      {JSON.stringify(user)}
      <h1>Polls</h1>
      <button onClick={handleOpenModal}>Create Poll</button>
      <PollFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handlePollSubmit} />
      {polls?.map((poll: any) => {
        console.log(poll);
        return (
          <div key={poll.id}>
            <div>
              <PollComp
                poll={poll}
                handleVote={handleVote}
                handleAnswerUpdate={(answer: string) => setSelectedAnswer(answer)}
              />
              CREATOR: {poll.user.name}, ID: {poll.user.id}
              {poll.votes.map((vote: any) => (
                <div key={vote.userId}>
                  USER: {vote.userId}, VOTE: {vote.answer}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
