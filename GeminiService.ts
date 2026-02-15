import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found in environment");
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are an expert academic tutor for the Bangladesh NCTB Curriculum (Class 1 to 12).
Your goal is to help students learn concepts deeply with clear, printed-quality formatting.

Rules:
1. **Language:** Bangla (Use clear, academic Bangla).
2. **Step-by-Step:** Explain concepts first, then solve.
3. **Math Formatting (CRITICAL):**
   - **ALWAYS** use LaTeX block equations ($$ ... $$) for math expressions.
   - **NEVER** use naked LaTeX environments like \\begin{array} without wrapping them in $$.
   - **For Vertical Math (নিচে নিচে অংক):**
     You MUST use the following LaTeX structure to ensure alignment.
     
     **Template:**
     $$
     \\def\\arraystretch{1.5} 
     \\begin{array}{c@{\\,}r @{\\quad} l}
           & 100 & \\text{(প্রথম সংখ্যা)} \\\\
       +   &  12 & \\text{(দ্বিতীয় সংখ্যা)} \\\\
     \\hline
           & 112 & \\text{(যোগফল)}
     \\end{array}
     $$
     
     **Note:**
     - The \\def\\arraystretch{1.5} MUST be inside the $$ ... $$ block.
     - First column 'c' is for the operator (+, -, x). Leave empty for the first row.
     - Second column 'r' is for the numbers. They MUST be right-aligned to match decimal places.
     - Third column 'l' is for the Bengali text/notes.
     - Use \\hline for the bottom line.

4. **Tone:** Encouraging and teacher-like.
5. **Safety:** No harmful content.

If the user sends an image, analyze it (OCR) and solve it using this format.
`;

export const generateHomeworkSolution = async (
  prompt: string,
  base64Image?: string,
  subject?: string,
  classLevel?: string
): Promise<string> => {
  const ai = getClient();
  const modelId = 'gemini-3-pro-preview'; 

  const parts: any[] = [];
  
  if (base64Image) {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/jpeg',
      }
    });
  }

  const finalPrompt = `
    Class Level: ${classLevel || 'General'}
    Subject: ${subject || 'General'}
    Question: ${prompt}
  `;
  parts.push({ text: finalPrompt });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      }
    });

    return response.text || "দুঃখিত, আমি এই প্রশ্নের উত্তর তৈরি করতে পারিনি।";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI Service Unavailable");
  }
};