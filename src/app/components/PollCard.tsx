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
import { BarChart } from "@mantine/charts";
import { v4 as randomUUID } from "uuid";
import { Carousel } from "@mantine/carousel";
import { IconDotsVertical, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { fetchGraphQL, getTimeElapsed } from "../util";
import { useSession } from "next-auth/react";
import { useVote } from "../hooks/useVote";
import { PollQuery, User, Vote } from "../types";

const VOTE_MUTATION = `
  mutation CreateVote($userId: ID!, $pollId: ID!, $answer: String!) {
    createVote(userId: $userId, pollId: $pollId, answer: $answer) {
      pollId
      userId
      answer
    }
  }
`;

interface PollHeaderProps {
  poll: PollQuery;
}

const PollHeader = ({ poll }: PollHeaderProps) => (
  <CardSection withBorder inheritPadding py="xs" bg="blue">
    <Group justify="space-between">
      <Group gap="xs">
        <Avatar src={poll?.user?.image} size="sm" />
        <Text
          c="white"
          fw={700}
          truncate
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {poll.title}
        </Text>
      </Group>
      <Group gap="0" bg="blue.5">
        <Badge bg="blue.5" leftSection={<IconUsers size={16} color="white" />}>
          {poll.totalVotesCount || 0}
        </Badge>
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
);

interface VotingSectionProps {
  poll: PollQuery;
  vote: Vote | null;
  selectedVoteAnswer?: string;
  setSelectedVoteAnswer: (answer: string) => void;
  handleVote: () => void;
}

const VotingSection = ({ poll, vote, selectedVoteAnswer, setSelectedVoteAnswer, handleVote }: VotingSectionProps) => (
  <CardSection p="lg">
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
          const percentage =
            Math.round(
              ((poll[`answer${idx + 1}Count` as keyof PollQuery] as number) / (poll?.totalVotesCount || 1)) * 100
            ) || 0;
          return (
            <Group key={`${answer}-${poll?.id}-${randomUUID()}`} justify="space-between">
              <Radio value={answer} label={answer} disabled={!!vote?.answer} />
              <Progress.Root w="50%" h="100%">
                <Progress.Section color="blue.2" value={percentage} h={15}>
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
  </CardSection>
);

interface GenderResultsSectionProps {
  poll: PollQuery;
}

const GenderResultsSection = ({ poll }: GenderResultsSectionProps) => (
  <CardSection p="lg" w="100%" h="100%">
    <BarChart
      h={150}
      p="xs"
      bg="gray.0"
      data={transformPollDataForBarChart(poll)}
      dataKey="answer"
      withTooltip
      withLegend
      series={[
        { name: "Male", color: "blue.6" },
        { name: "Female", color: "red.6" },
      ]}
    />
  </CardSection>
);

const transformPollDataForBarChart = (poll: PollQuery) =>
  poll.answers.map((answer, idx) => ({
    answer,
    Male: poll[`answer${idx + 1}MaleCount` as keyof PollQuery] || 0,
    Female: poll[`answer${idx + 1}FemaleCount` as keyof PollQuery] || 0,
  }));

export const PollCard = ({ poll, voter }: { poll: PollQuery; voter: User | null }) => {
  const { vote, setVote } = useVote(poll.id, voter?.id);
  const [selectedVoteAnswer, setSelectedVoteAnswer] = useState<string>();
  const { data: session } = useSession();

  useEffect(() => {
    setSelectedVoteAnswer(vote?.answer);
  }, [vote?.answer]);

  const handleVote = async () => {
    if (!voter) {
      alert("Please sign in to vote.");
      return;
    }
    if (vote?.answer) {
      alert(`User has already voted with answer: ${vote.answer}`);
      return;
    }
    if (!selectedVoteAnswer) {
      alert("Please select an answer before voting.");
      return;
    }
    // @ts-expect-error TEMPORARY FIX
    if (!session?.accessToken) {
      alert("Please sign in to vote.");
      return;
    }

    const { createVote }: { createVote: Vote } = await fetchGraphQL(
      VOTE_MUTATION,
      {
        userId: voter.id,
        pollId: poll.id,
        answer: selectedVoteAnswer,
      },
      // @ts-expect-error TEMPORARY FIX
      session.accessToken
    );
    setVote(createVote);
  };

  return (
    <Card m="xs" shadow="md" withBorder radius="md" pb="xs">
      <PollHeader poll={poll} />
      <Carousel loop>
        <Carousel.Slide>
          <VotingSection
            poll={poll}
            vote={vote}
            selectedVoteAnswer={selectedVoteAnswer}
            setSelectedVoteAnswer={setSelectedVoteAnswer}
            handleVote={handleVote}
          />
        </Carousel.Slide>
        {poll?.totalVotesCount && (
          <Carousel.Slide style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GenderResultsSection poll={poll} />
          </Carousel.Slide>
        )}
      </Carousel>
    </Card>
  );
};
