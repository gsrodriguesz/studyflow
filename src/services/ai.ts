import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
// Using gemini-1.5-flash as it is more stable and widely available than 2.0-flash
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

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

    async generateSimulationFromText(text: string, answerKeyText?: string, onProgress?: (progress: number) => void): Promise<SimulationData | null> {
        if (!API_KEY) return null;

        // Chunking strategy to handle large exams
        const CHUNK_SIZE = 15000;
        const chunks = [];
        for (let i = 0; i < text.length; i += CHUNK_SIZE) {
            chunks.push(text.substring(i, i + CHUNK_SIZE));
        }

        let allQuestions: QuizQuestion[] = [];
        let examTitle = "Generated Simulation";

        console.log(`Processing ${chunks.length} chunks...`);

        for (let i = 0; i < chunks.length; i++) {
            if (onProgress) {
                onProgress(Math.round(((i) / chunks.length) * 100));
            }
            const chunk = chunks[i];
            const isFirstChunk = i === 0;

            let prompt = `
                Analyze the following text segment from an exam. Extract ${isFirstChunk ? 'the exam title and ' : ''} all questions found in this segment.
                
                Exam Segment (${i + 1}/${chunks.length}):
                "${chunk}"
            `;

            if (answerKeyText) {
                prompt += `
                
                Reference Answer Key (for the whole exam):
                "${answerKeyText.substring(0, 20000)}"
                
                Use this Answer Key to determine the correct answer for the questions found in the segment above.
                `;
            }

            prompt += `
                Output ONLY a JSON object with this structure:
                {
                    ${isFirstChunk ? '"title": "Exam Title",' : ''}
                    "questions": [
                        {
                            "id": "1", // Use sequential numbers starting from 1 for this segment
                            "question": "Question text",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correctAnswer": 0, // Index of correct option (0-3). If not found, infer the most likely correct answer or set to -1.
                            "explanation": "Brief explanation of why this is correct",
                            "topic": "Specific topic of this question (e.g. 'Derivatives', 'History of Rome', 'Organic Chemistry'). BE SPECIFIC and varied."
                        }
                    ]
                }
                
                IMPORTANT:
                1. Extract ALL questions in this segment. Do not skip any.
                2. Ensure "topic" is specific to the question content, not just "General".
                3. If a question is cut off at the end of the segment, ignore it.
                4. No markdown.
            `;

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const responseText = response.text();

                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : responseText;

                const data = JSON.parse(jsonString) as Partial<SimulationData>;

                if (isFirstChunk && data.title) {
                    examTitle = data.title;
                }

                if (data.questions && Array.isArray(data.questions)) {
                    allQuestions = [...allQuestions, ...data.questions];
                }
            } catch (error) {
                console.error(`Error processing chunk ${i + 1}:`, error);
                // Continue to next chunk even if one fails
            }
        }

        if (allQuestions.length === 0) return null;

        // Re-index questions to ensure unique IDs
        const finalQuestions = allQuestions.map((q, index) => ({
            ...q,
            id: `q_${index + 1}`,
            // Ensure options is always an array
            options: Array.isArray(q.options) ? q.options : []
        }));

        return {
            title: examTitle,
            questions: finalQuestions
        };
    },

    async generateSimulationFromImages(images: string[], answerKeyText?: string, onProgress?: (progress: number) => void): Promise<SimulationData | null> {
        if (!API_KEY) return null;

        // Process in batches of 3 pages to avoid hitting token limits while maintaining context
        const BATCH_SIZE = 3;
        let allQuestions: QuizQuestion[] = [];
        let examTitle = "Generated Simulation";

        console.log(`Processing ${images.length} pages in batches of ${BATCH_SIZE}...`);

        for (let i = 0; i < images.length; i += BATCH_SIZE) {
            if (onProgress) {
                onProgress(Math.round(((i) / images.length) * 100));
            }
            const imageBatch = images.slice(i, i + BATCH_SIZE);
            const isFirstBatch = i === 0;

            // Prepare image parts for Gemini
            const imageParts = imageBatch.map(base64 => ({
                inlineData: {
                    data: base64,
                    mimeType: "image/jpeg"
                }
            }));

            let prompt = `
                Analyze these images which are pages from an exam. Extract ${isFirstBatch ? 'the exam title and ' : ''} all questions visible in these pages.
                
                The images may contain multiple columns, tables, or complex layouts. Read them carefully.
            `;

            if (answerKeyText) {
                prompt += `
                
                Reference Answer Key (for the whole exam):
                "${answerKeyText.substring(0, 10000)}"
                
                Use this Answer Key to determine the correct answer for the questions found in these pages.
                `;
            }

            prompt += `
                Output ONLY a valid JSON object.
                
                CRITICAL JSON FORMATTING RULES:
                1. TEXT CONTENT: Escape all double quotes (") inside strings as (\\").
                2. NEWLINES: Do NOT use actual newline characters inside strings. Use the literal characters \\n for line breaks.
                3. BACKSLASHES: Escape backslashes as \\\\.
                4. STRUCTURE: Ensure all arrays and objects are correctly closed with } and ].
                5. SEPARATORS: Ensure all properties and array items are separated by commas.
                
                Structure:
                {
                    ${isFirstBatch ? '"title": "Exam Title",' : ''}
                    "questions": [
                        {
                            "id": "1", // Use sequential numbers starting from 1 for this batch
                            "question": "Question text. INCLUDE any statements (I, II, III) or texts that precede the options here. Do NOT include the options text here.",
                            "options": ["Full text of Option A", "Full text of Option B", "Full text of Option C", "Full text of Option D"],
                            "correctAnswer": 0, // Index of correct option (0-3). If not found, infer the most likely correct answer or set to -1.
                            "explanation": "Brief explanation of why this is correct",
                            "topic": "Specific topic of this question (e.g. 'Derivatives', 'History of Rome', 'Organic Chemistry'). BE SPECIFIC."
                        }
                    ]
                }
                
                IMPORTANT CONTENT RULES:
                1. IGNORE general exam instructions, cover pages, headers, footers, and requests to transcribe phrases. ONLY extract actual exam questions.
                2. HANDLING TEXTS: If a question refers to a specific text, poem, or passage shown in the image, YOU MUST INCLUDE that text in the "question" field.
                3. HANDLING STATEMENTS: If a question has statements to evaluate (e.g., I, II, III) before the options, KEEP THEM IN THE "question" TEXT.
                4. HANDLING OPTIONS: 
                   - The "options" array must contain the FULL TEXT of the answer choices.
                   - Do NOT put just "A", "B", "C", etc. Put the actual content.
                   - If options are inline in the question text, REMOVE them from the "question" field and split them into the "options" array.
                5. No markdown.
            `;

            try {
                // Send prompt + images
                const result = await model.generateContent([prompt, ...imageParts]);
                const response = await result.response;
                const responseText = response.text();

                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : responseText;

                const data = JSON.parse(jsonString) as Partial<SimulationData>;

                if (isFirstBatch && data.title) {
                    examTitle = data.title;
                }

                if (data.questions && Array.isArray(data.questions)) {
                    allQuestions = [...allQuestions, ...data.questions];
                }
            } catch (error) {
                console.error(`Error processing image batch ${i / BATCH_SIZE + 1}:`, error);
            }
        }

        if (allQuestions.length === 0) return null;

        // Re-index questions
        const finalQuestions = allQuestions.map((q, index) => ({
            ...q,
            id: `q_${index + 1}`,
            options: Array.isArray(q.options) ? q.options : []
        }));

        return {
            title: examTitle,
            questions: finalQuestions
        };
    }
};
