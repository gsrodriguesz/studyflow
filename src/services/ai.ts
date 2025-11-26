import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface PlannerInput {
    topic: string;
    scope: string;
    targetDate: Date;
    weeklyCapacity: string;
}

export interface StudySession {
    date: string;
    topic: string;
    durationMinutes: number;
    description: string;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic?: string;
}

export interface SimulationData {
    title: string;
    questions: QuizQuestion[];
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
}

export const AIService = {
    async generateStudyPlan(input: PlannerInput): Promise<StudySession[]> {
        if (!API_KEY) {
            console.warn("Gemini API Key is missing. Returning mock data.");
            return [];
        }

        const prompt = `
            Act as an expert study planner. Create a study schedule for the following request:
            Topic: ${input.topic}
            Scope/Details: ${input.scope}
            Target Date: ${input.targetDate.toISOString().split('T')[0]}
            Weekly Capacity: ${input.weeklyCapacity}

            Output ONLY a JSON array of objects. Each object must have these fields:
            - "date" (YYYY-MM-DD string)
            - "topic" (string, specific sub-topic)
            - "durationMinutes" (number, between 45 and 90)
            - "description" (string, brief instruction)

            Distribute the sessions logically leading up to the target date. Do not include markdown formatting like \`\`\`json. Just the raw JSON.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Clean up potential markdown code blocks
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText) as StudySession[];
        } catch (error) {
            console.error("Error generating study plan:", error);
            throw error;
        }
    },

    async generateQuiz(content: string): Promise<QuizQuestion[]> {
        if (!API_KEY) return [];

        const prompt = `
            Generate a quiz with 3 multiple choice questions based on the following content:
            "${content.substring(0, 2000)}..."

            Output ONLY a JSON array. Each object must have:
            - "id" (string)
            - "question" (string)
            - "options" (array of 4 strings)
            - "correctAnswer" (number, index 0-3)
            - "explanation" (string)
            
            No markdown.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log("Generated Quiz JSON:", cleanText);
            return JSON.parse(cleanText) as QuizQuestion[];
        } catch (error) {
            console.error("Error generating quiz:", error);
            return [];
        }
    },

    async generateFlashcards(content: string): Promise<Flashcard[]> {
        if (!API_KEY) return [];

        const prompt = `
            Generate 5 flashcards based on the following content:
            "${content.substring(0, 2000)}..."

            Output ONLY a JSON array. Each object must have:
            - "id" (string)
            - "front" (string, question or term)
            - "back" (string, answer or definition)

            No markdown.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText) as Flashcard[];
        } catch (error) {
            console.error("Error generating flashcards:", error);
            return [];
        }
    },

    async generateSimulationFromText(text: string, answerKeyText?: string): Promise<SimulationData | null> {
        if (!API_KEY) return null;

        let prompt = `
            Analyze the following text which is an exam or quiz. Extract the title (if any, otherwise infer one) and all questions.
            
            Exam Content:
            "${text.substring(0, 10000)}..."
        `;

        if (answerKeyText) {
            prompt += `
            
            Answer Key Content:
            "${answerKeyText.substring(0, 5000)}..."
            
            Use the provided Answer Key to determine the correct answer for each question.
            `;
        }

        prompt += `
            Output ONLY a JSON object with this structure:
            {
                "title": "Exam Title",
                "questions": [
                    {
                        "id": "1",
                        "question": "Question text",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": 0, // Index of correct option (0-3). If not found, infer the most likely correct answer or set to -1.
                        "explanation": "Brief explanation of why this is correct (derived from answer key if available)",
                        "topic": "Specific topic of this question (e.g. 'Derivatives', 'History of Rome', 'Organic Chemistry')"
                    }
                ]
            }
            
            Ensure options are extracted cleanly. If it's an open-ended question, try to convert it to multiple choice or skip it.
            No markdown.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();

            // Improved JSON extraction
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : responseText;

            return JSON.parse(jsonString) as SimulationData;
        } catch (error) {
            console.error("Error generating simulation:", error);
            return null;
        }
    }
};
