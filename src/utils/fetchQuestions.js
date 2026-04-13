import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const fetchQuestions = async () => {
  try {
    const client = new DynamoDBClient({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY,
      },
    });
    
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Scan full table
    const command = new ScanCommand({ TableName: "questions" });
    const response = await docClient.send(command);
    const questions = response.Items || [];

    // Group by difficulty
    const grouped = {
      easy: questions.filter(q => q.difficulty === 'easy'),
      medium: questions.filter(q => q.difficulty === 'medium'),
      hard: questions.filter(q => q.difficulty === 'hard'),
    };
    
    // Shuffle groups to randomize selection
    grouped.easy = shuffleArray(grouped.easy);
    grouped.medium = shuffleArray(grouped.medium);
    grouped.hard = shuffleArray(grouped.hard);
    
    let selected = [];
    
    // Attempt: 4 easy, 4 medium, 2 hard
    const easySelection = grouped.easy.splice(0, 4);
    const mediumSelection = grouped.medium.splice(0, 4);
    const hardSelection = grouped.hard.splice(0, 2);
    
    selected.push(...easySelection, ...mediumSelection, ...hardSelection);
    
    // Fill remainder if we didn't have enough exactly balancing in any difficulty pool
    const required = 10 - selected.length;
    if (required > 0) {
      const remaining = shuffleArray([...grouped.easy, ...grouped.medium, ...grouped.hard]);
      selected.push(...remaining.splice(0, required));
    }
    
    // Shuffle the final array of 10 selected questions
    selected = shuffleArray(selected);
    
    // Format and shuffle the multiple-choice options dynamically
    const finalQuestions = selected.map(q => {
      const originalCorrectText = q.options[q.correctIndex];
      const newOptions = shuffleArray(q.options);
      const newCorrectIndex = newOptions.indexOf(originalCorrectText);
      
      return {
        ...q,
        options: newOptions,
        correctIndex: newCorrectIndex
      };
    });
    
    return finalQuestions;
  } catch (error) {
    console.error("Error fetching questions from DynamoDB:", error);
    throw error;
  }
};
