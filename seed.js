import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

// Create DynamoDB client
const client = new DynamoDBClient({
  region: process.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY,
    secretAccessKey: process.env.VITE_AWS_SECRET_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "questions";

// Array of exactly 30 questions: 12 easy, 12 medium, 6 hard
const rawQuestions = [
  // --- EASY (12) ---
  {
    questionText: "What is the capital of France?",
    options: ["Berlin", "London", "Paris", "Madrid"],
    correctIndex: 2,
    difficulty: "easy",
    category: "general",
    explanation: "Paris is renowned as the capital and most populous city of France."
  },
  {
    questionText: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctIndex: 1,
    difficulty: "easy",
    category: "science",
    explanation: "Mars appears red due to iron oxide (rust) on its surface."
  },
  {
    questionText: "What is 7 + 5?",
    options: ["10", "11", "12", "13"],
    correctIndex: 2,
    difficulty: "easy",
    category: "math",
    explanation: "Seven plus five simply equals twelve."
  },
  {
    questionText: "Who wrote 'Romeo and Juliet'?",
    options: ["William Shakespeare", "Charles Dickens", "Mark Twain", "Jane Austen"],
    correctIndex: 0,
    difficulty: "easy",
    category: "history",
    explanation: "William Shakespeare wrote the famous tragedy Romeo and Juliet early in his career."
  },
  {
    questionText: "What is the chemical symbol for Water?",
    options: ["H2O", "CO2", "O2", "NaCl"],
    correctIndex: 0,
    difficulty: "easy",
    category: "science",
    explanation: "Water consists of two hydrogen atoms and one oxygen atom."
  },
  {
    questionText: "How many sides does a triangle have?",
    options: ["2", "3", "4", "5"],
    correctIndex: 1,
    difficulty: "easy",
    category: "math",
    explanation: "A triangle is a polygon with exactly three sides and three vertices."
  },
  {
    questionText: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctIndex: 3,
    difficulty: "easy",
    category: "general",
    explanation: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions."
  },
  {
    questionText: "What do bees collect to make honey?",
    options: ["Pollen", "Nectar", "Leaves", "Water"],
    correctIndex: 1,
    difficulty: "easy",
    category: "science",
    explanation: "Bees collect nectar from flowers and digest it into honey."
  },
  {
    questionText: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
    correctIndex: 2,
    difficulty: "easy",
    category: "history",
    explanation: "George Washington served as the first U.S. President from 1789 to 1797."
  },
  {
    questionText: "What is 10 x 10?",
    options: ["10", "100", "1000", "20"],
    correctIndex: 1,
    difficulty: "easy",
    category: "math",
    explanation: "Ten times ten equals one hundred."
  },
  {
    questionText: "Which animal is the tallest in the world?",
    options: ["Elephant", "Giraffe", "Hippopotamus", "Ostrich"],
    correctIndex: 1,
    difficulty: "easy",
    category: "general",
    explanation: "The giraffe is the tallest living terrestrial animal."
  },
  {
    questionText: "Is the Earth flat or round?",
    options: ["Flat", "Round", "Square", "Triangle"],
    correctIndex: 1,
    difficulty: "easy",
    category: "science",
    explanation: "The Earth is an oblate spheroid, making it generally round."
  },

  // --- MEDIUM (12) ---
  {
    questionText: "In what year did the Titanic sink?",
    options: ["1910", "1912", "1914", "1920"],
    correctIndex: 1,
    difficulty: "medium",
    category: "history",
    explanation: "The RMS Titanic sank on April 15, 1912, after striking an iceberg."
  },
  {
    questionText: "What is the square root of 144?",
    options: ["10", "12", "14", "16"],
    correctIndex: 1,
    difficulty: "medium",
    category: "math",
    explanation: "12 times 12 equals 144."
  },
  {
    questionText: "Which gas is most abundant in the Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 2,
    difficulty: "medium",
    category: "science",
    explanation: "Nitrogen makes up about 78% of the Earth's atmosphere."
  },
  {
    questionText: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correctIndex: 2,
    difficulty: "medium",
    category: "general",
    explanation: "Canberra was selected as the capital as a compromise between Sydney and Melbourne."
  },
  {
    questionText: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctIndex: 2,
    difficulty: "medium",
    category: "general",
    explanation: "The Mona Lisa was painted by the Italian Renaissance artist Leonardo da Vinci."
  },
  {
    questionText: "Which planet is the hottest in the solar system?",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    correctIndex: 1,
    difficulty: "medium",
    category: "science",
    explanation: "Venus is the hottest planet due to its thick, heat-trapping atmosphere."
  },
  {
    questionText: "Solve: (6 × 3) - 4",
    options: ["12", "14", "16", "22"],
    correctIndex: 1,
    difficulty: "medium",
    category: "math",
    explanation: "First multiply 6 by 3 to get 18, then subtract 4 to get 14."
  },
  {
    questionText: "Which ancient civilization built the Machu Picchu?",
    options: ["Aztecs", "Mayans", "Incas", "Olmecs"],
    correctIndex: 2,
    difficulty: "medium",
    category: "history",
    explanation: "Machu Picchu was built by the Inca Empire in the 15th century."
  },
  {
    questionText: "What does DNA stand for?",
    options: ["Deoxyribonucleic Acid", "Diribonucleic Acid", "Dioxyribonuclear Acid", "Deoxynucleic Acid"],
    correctIndex: 0,
    difficulty: "medium",
    category: "science",
    explanation: "DNA is short for Deoxyribonucleic Acid."
  },
  {
    questionText: "Which continent is the Sahara Desert located on?",
    options: ["Asia", "South America", "Africa", "Australia"],
    correctIndex: 2,
    difficulty: "medium",
    category: "general",
    explanation: "The Sahara is the largest hot desert, encompassing much of North Africa."
  },
  {
    questionText: "What year did World War II end?",
    options: ["1943", "1945", "1947", "1950"],
    correctIndex: 1,
    difficulty: "medium",
    category: "history",
    explanation: "World War II officially ended in September 1945."
  },
  {
    questionText: "How many millimeters are in a meter?",
    options: ["10", "100", "1000", "10000"],
    correctIndex: 2,
    difficulty: "medium",
    category: "math",
    explanation: "The prefix 'milli-' means one thousandth, hence 1000 millimeters in 1 meter."
  },

  // --- HARD (6) ---
  {
    questionText: "What is the derivative of x^2?",
    options: ["x", "2x", "x^3", "2"],
    correctIndex: 1,
    difficulty: "hard",
    category: "math",
    explanation: "Using the power rule in calculus, the derivative of x^2 is 2x."
  },
  {
    questionText: "Who discovered Penicillin?",
    options: ["Marie Curie", "Louis Pasteur", "Alexander Fleming", "Gregor Mendel"],
    correctIndex: 2,
    difficulty: "hard",
    category: "science",
    explanation: "Alexander Fleming discovered penicillin in 1928 at St Mary's Hospital."
  },
  {
    questionText: "Which empire was ruled by Atahualpa?",
    options: ["Aztec Empire", "Roman Empire", "Inca Empire", "Ottoman Empire"],
    correctIndex: 2,
    difficulty: "hard",
    category: "history",
    explanation: "Atahualpa was the last emperor of the Inca Empire before the Spanish conquest."
  },
  {
    questionText: "What is the speed of light in a vacuum?",
    options: ["299,792 km/s", "150,000 km/s", "1,080,000 km/s", "100,000 km/s"],
    correctIndex: 0,
    difficulty: "hard",
    category: "science",
    explanation: "The exact speed of light in a vacuum is 299,792,458 meters per second."
  },
  {
    questionText: "In what year was the Magna Carta signed?",
    options: ["1066", "1215", "1492", "1603"],
    correctIndex: 1,
    difficulty: "hard",
    category: "history",
    explanation: "King John of England signed the Magna Carta in June 1215."
  },
  {
    questionText: "Solve for x: log2(x) = 3",
    options: ["6", "8", "9", "23"],
    correctIndex: 1,
    difficulty: "hard",
    category: "math",
    explanation: "The equation translates to 2 raised to the power of 3 equals x, which is 8."
  }
];

// Seed function
const seedDatabase = async () => {
  console.log(`Starting to seed ${rawQuestions.length} questions into '${TABLE_NAME}'...`);
  
  let successCount = 0;
  let failCount = 0;

  for (const q of rawQuestions) {
    const questionId = uuidv4();
    const item = { questionId, ...q };

    try {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));
      successCount++;
    } catch (error) {
      console.error(`Failed to seed question: "${q.questionText}"`, error);
      failCount++;
    }
  }

  console.log(`Seeding complete! Success: ${successCount}, Failed: ${failCount}`);
};

seedDatabase();
