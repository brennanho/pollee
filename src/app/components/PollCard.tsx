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
import { v4 as randomUUID } from 'uuid';
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { IconDotsVertical } from "@tabler/icons-react";
import React, { useState } from "react";
import { fetchGraphQL, getTimeElapsed } from "../util";
import { useSession } from "next-auth/react";

export const PollCard = ({ poll, voter }: any) => {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const { data: session } = useSession();

  const handleVote = async (poll: any) => {
    if (!selectedAnswer) {
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
    await fetchGraphQL(
      query,
      {
        userId: voter.id,
        pollId: poll.id,
        answer: selectedAnswer,
      },
      session.accessToken
    );
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
          <RadioGroup name="poll-answer" value={selectedAnswer} onChange={setSelectedAnswer} withAsterisk>
            <Stack p="xs">
              {poll.answers.map((answer: string) => (
                <Radio key={randomUUID()} value={answer} label={answer} />
              ))}
            </Stack>
          </RadioGroup>
          <Group justify="center">
            <Button onClick={handleVote} w="80px">
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
