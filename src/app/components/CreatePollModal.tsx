"use client";

import React, { useState } from "react";
import { Modal, Button, TextInput, Textarea, Group, ActionIcon, Stack, Grid, Affix } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useSession } from "next-auth/react";

type Poll = {
  id: string;
  userId: string;
  title: string;
  answers: string[];
  description?: string;
};

interface CreatePollModalProps {
  onSubmit: (poll: Poll) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const { data: session } = useSession();
  
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleAddAnswer = () => {
    const trimmedNewAnswer = newAnswer.trim();
    if (trimmedNewAnswer && !answers.includes(trimmedNewAnswer)) {
      setAnswers([...answers, trimmedNewAnswer]);
      setNewAnswer("");
    }
  };

  const handleRemoveAnswer = (index: number) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const poll: Poll = {
      id: crypto.randomUUID(),
      userId: session?.user?.email || "", // Replace with actual logged-in user's ID
      title,
      answers,
      description: description.trim() || undefined,
    };

    onSubmit(poll);
    setModalOpen(false);
  };

  return (
    <>
      <Affix position={{ bottom: 16, right: 0, left: 0 }} style={{ textAlign: "center" }}>
        <ActionIcon radius={16} size="lg" variant="light">
          <IconPlus onClick={handleOpenModal} />
        </ActionIcon>
      </Affix>
      <Modal opened={isModalOpen} onClose={handleCloseModal} title="Create Poll" centered>
        <Stack gap="xs">
          <TextInput
            label="Title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextInput
            label={
              <Group mb="xs">
                Answer
                <ActionIcon onClick={handleAddAnswer}>
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>
            }
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
          />

          <Grid mt="sm" mb="xs" columns={2} gutter="xs">
            {answers.map((answer, index) => (
              <Grid.Col key={index} span={1}>
                <Group>
                  <ActionIcon color="red" size="sm" onClick={() => handleRemoveAnswer(index)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                  {answer}
                </Group>
              </Grid.Col>
            ))}
          </Grid>
          <Group justify="center">
            <Button onClick={handleSubmit} disabled={!title || answers.length <= 1}>
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
