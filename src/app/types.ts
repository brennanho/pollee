export type Poll = {
    id: string;
    userId: string;
    title: string;
    answers: string[];
    description?: string;
};

export type PollQuery = {
    id: string;
    title: string;
    answers: string[];
    description: string;
    createdAt: number;
    user: {
        id: string;
        name: string;
        image: string;
    }
    // Results
    totalVotesCount?: number;
    answer1Count?: number;
    answer2Count?: number;
    answer3Count?: number;
    answer4Count?: number;
    answer1MaleCount?: number;
    answer2MaleCount?: number;
    answer3MaleCount?: number;
    answer4MaleCount?: number;
    answer1FemaleCount?: number;
    answer2FemaleCount?: number;
    answer3FemaleCount?: number;
    answer4FemaleCount?: number;
}

export type User = {
    id: string;
    name: string;
    image: string;
    generation?: string;
    gender?: string;
}

export type Vote = {
    userId: string;
    pollId: string;
    answer: string;
}