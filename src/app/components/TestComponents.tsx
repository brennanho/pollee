"use client";

import React, { useState } from "react";
import Modal from "react-modal"; // You can install this with `npm install react-modal`

// Poll type
type Poll = {
  id: string;
  userId: string;
  title: string;
  answers: string[];
  voteIds: string[];
  description?: string;
};

// Modal styling (customize as needed)
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "400px",
    padding: "20px",
  },
};

interface PollFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poll: Poll) => void;
}

export const PollFormModal: React.FC<PollFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleAddAnswer = () => {
    if (newAnswer.trim()) {
      setAnswers([...answers, newAnswer.trim()]);
      setNewAnswer("");
    }
  };

  const handleRemoveAnswer = (index: number) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const poll: Poll = {
      id: crypto.randomUUID(),
      userId: "currentUserId", // Replace with the actual logged-in user's ID
      title,
      answers,
      voteIds: [],
      description: description.trim() || undefined,
    };

    onSubmit(poll);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} ariaHideApp={false}>
      <h2>Create Poll</h2>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter poll title"
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter poll description (optional)"
        />
      </div>
      <div>
        <label>Answers:</label>
        <ul>
          {answers.map((answer, index) => (
            <li key={index}>
              {answer} <button onClick={() => handleRemoveAnswer(index)}>Remove</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Add a new answer"
        />
        <button onClick={handleAddAnswer}>Add Answer</button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSubmit} disabled={!title || answers.length === 0}>
          Submit
        </button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export const PollComp = ({ poll, handleVote, handleAnswerUpdate }: any) => {
  return (
    <div>
      <h2>{poll.title}</h2>
      <p>{poll.description}</p>
      {poll.answers.map((answer: string) => (
        <div key={answer}>
          <label>
            <input type="radio" name="poll-answer" value={answer} onChange={() => handleAnswerUpdate(answer)} />
            {answer}
          </label>
        </div>
      ))}
      <button onClick={() => handleVote(poll)}>Vote</button>
    </div>
  );
};
