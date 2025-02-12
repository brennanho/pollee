"use client";

import {
  Card,
  CardSection,
  ActionIcon,
  Group,
  Text,
  Menu,
  MenuTarget,
  Stack,
  MenuItem,
  MenuDropdown,
  RadioGroup,
  Radio,
  Button,
  Avatar,
} from "@mantine/core";
import { v4 as randomUUID } from "uuid";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { IconDotsVertical } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { fetchGraphQL, getTimeElapsed } from "../util";
import { useSession } from "next-auth/react";
import { useVote, Vote } from "../hooks/useVote";

export const PollCard = ({ poll, voter }: any) => {
  const { vote, setVote } = useVote(poll?.id, voter?.id);
  const [selectedVoteAnswer, setSelectedVoteAnswer] = useState<string | undefined>();
  const { data: session } = useSession();

  useEffect(() => {
    setSelectedVoteAnswer(vote?.answer);
  }, [vote?.answer]);

  const handleVote = async () => {
    if (vote?.answer) {
      alert(`User has already voted with answer: ${vote.answer}`);
      return;
    }
    if (!selectedVoteAnswer) {
      alert("Please select an answer before voting.");
      return;
    }
    if (!session?.accessToken) {
      alert("Please sign in to vote.");
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
    const { createVote }: { createVote: Vote } = await fetchGraphQL(
      query,
      {
        userId: voter.id,
        pollId: poll.id,
        answer: selectedVoteAnswer,
      },
      session.accessToken
    );
    setVote(createVote);
  };

  return (
    <Carousel loop>
      <CarouselSlide>
        <Card m="xs" shadow="md" withBorder radius="md">
          <CardSection withBorder inheritPadding py="xs" bg="blue">
            <Group justify="space-between">
              <Group>
                <Avatar src={poll?.user?.image} size="sm" />
                <Text c="white" fw={700}>
                  {poll.title}
                </Text>
              </Group>
              <Group justify="flex-end" gap="xs">
                <Text c="white" size="xs">
                  {getTimeElapsed(poll.createdAt)}
                </Text>
                <Menu withinPortal position="bottom-end" shadow="lg">
                  <MenuTarget>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical color="white" size={16} />
                    </ActionIcon>
                  </MenuTarget>
                  <MenuDropdown>
                    <MenuItem>Share</MenuItem>
                  </MenuDropdown>
                </Menu>
              </Group>
            </Group>
          </CardSection>

          <Text mt="sm" c="dimmed" size="sm">
            {poll.description}
          </Text>
          <RadioGroup
            value={selectedVoteAnswer}
            defaultValue={vote?.answer}
            defaultChecked
            onChange={setSelectedVoteAnswer}
            withAsterisk
          >
            <Stack p="xs">
              {poll.answers.map((answer: string) => (
                <Radio
                  key={`${answer}-${poll?.id}-${randomUUID()}`}
                  value={answer}
                  label={answer}
                  disabled={!!vote?.answer}
                />
              ))}
            </Stack>
          </RadioGroup>
          <Group justify="center">
            <Button onClick={handleVote} w="80px" disabled={!!vote?.answer}>
              VOTE
            </Button>
          </Group>
        </Card>
      </CarouselSlide>
      <CarouselSlide>
        <Card m="xs" shadow="md" withBorder radius="md">
          TBD
        </Card>
      </CarouselSlide>
    </Carousel>
  );
};
