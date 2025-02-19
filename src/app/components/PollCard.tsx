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
  Progress,
  RadioGroup,
  Radio,
  Button,
  Avatar,
  Badge,
} from "@mantine/core";
import { PieChart } from "@mantine/charts";
import { v4 as randomUUID } from "uuid";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { IconDotsVertical, IconUsers } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { fetchGraphQL, getTimeElapsed } from "../util";
import { useSession } from "next-auth/react";
import { useVote } from "../hooks/useVote";
import { PollQuery, User, Vote } from "../types";

const CardSectionBody = ({ children }: any) => {
  return <CardSection p="lg">{children}</CardSection>;
};

export const PollCard = ({ poll, voter }: { poll: PollQuery; voter: User | null }) => {
  const { vote, setVote } = useVote(poll.id, voter?.id);
  const [selectedVoteAnswer, setSelectedVoteAnswer] = useState<string | undefined>();
  const { data: session } = useSession();

  useEffect(() => {
    setSelectedVoteAnswer(vote?.answer);
  }, [vote?.answer]);

  const handleVote = async () => {
    if (!voter) {
      alert("Please sign in to vote.");
    } else if (vote?.answer) {
      alert(`User has already voted with answer: ${vote.answer}`);
    } else if (!selectedVoteAnswer) {
      alert("Please select an answer before voting.");
    } else if (!session?.accessToken) {
      alert("Please sign in to vote.");
    } else {
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
    }
  };

  return (
    <Card m="xs" shadow="md" pb="0" withBorder radius="md">
      <CardSection withBorder inheritPadding py="xs" bg="blue">
        <Group justify="space-between">
          <Group gap="xs">
            <Avatar src={poll?.user?.image} size="sm" />
            <Text c="white" fw={700}>
              {poll.title}
            </Text>
          </Group>
          <Group gap="4px" bg="blue.5">
            {poll?.totalVotesCount && (
              <Badge bg="blue.5" leftSection={<IconUsers size={16} color="white" />}>
                {poll.totalVotesCount}
              </Badge>
            )}
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
      <Carousel loop>
        <CarouselSlide>
          <CardSectionBody>
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
                {poll.answers.map((answer: string, idx: number) => {
                  const percentage = Math.round((poll[`answer${idx + 1}Count`] / poll?.totalVotesCount) * 100) || 0;
                  return (
                    <Group key={`${answer}-${poll?.id}-${randomUUID()}`} justify="space-between">
                      <Radio value={answer} label={answer} disabled={!!vote?.answer} />
                      <Progress.Root w="50%">
                        <Progress.Section color="blue.2" value={percentage}>
                          <Progress.Label>{percentage}%</Progress.Label>
                        </Progress.Section>
                      </Progress.Root>
                    </Group>
                  );
                })}
              </Stack>
            </RadioGroup>
            <Group justify="center">
              <Button onClick={handleVote} disabled={!!vote?.answer}>
                VOTE
              </Button>
            </Group>
          </CardSectionBody>
        </CarouselSlide>
        <CarouselSlide>
          <CardSectionBody>
            <Card bg="gray.1" p="0" w="auto">
              <Group justify="center">
                <PieChart
                  withTooltip
                  strokeWidth={2}
                  data={transformPollDataForGenderPieChart(poll)}
                  labelsPosition="inside"
                  labelsType="percent"
                  withLabels
                />
              </Group>
            </Card>
          </CardSectionBody>
        </CarouselSlide>
      </Carousel>
    </Card>
  );
};

function transformPollDataForGenderPieChart(poll: PollQuery) {
  const male = poll.answers.map((ans, idx) => {
    return { name: `Male - ${ans}`, value: poll[`answer${idx + 1}MaleCount`] || 0, color: `blue.${idx + 1}` };
  });
  const female = poll.answers.map((ans, idx) => {
    return { name: `Female - ${ans}`, value: poll[`answer${idx + 1}FemaleCount`] || 0, color: `red.${idx + 1}` };
  });

  return [...male, ...female].filter((ans) => ans.value > 0);
}
