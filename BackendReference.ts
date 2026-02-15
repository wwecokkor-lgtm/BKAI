// =========================================================
// 📄 REFERENCE ONLY: PRODUCTION BACKEND CODE (Node.js/Express)
// Use this code when deploying to a real server (Heroku/Vercel/Firebase)
// =========================================================

/*
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Secure API Key from Server Environment
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

const SYSTEM_INSTRUCTION = `
You are an academic tutor for Bangladesh curriculum.
Explain step by step.
Respond in Bangla by default.
Encourage learning.
Do not provide harmful content.
`;

app.post('/api/solve', async (req, res) => {
  try {
    const { userId, question, image, subject } = req.body;
    
    // 1. Validate User & Check Subscription
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return res.status(401).send('User not found');
    const userData = userDoc.data();

    // 2. Rate Limiting Logic
    const today = new Date().toISOString().split('T')[0];
    if (userData.lastUsageDate !== today) {
       await userRef.update({ dailyUsage: 0, lastUsageDate: today });
       userData.dailyUsage = 0;
    }

    if (userData.subscriptionType === 'FREE' && userData.dailyUsage >= 5) {
      return res.status(403).json({ error: 'Daily limit reached' });
    }

    // 3. Gemini API Call
    const parts = [];
    if (image) {
      parts.push({
         inlineData: { data: image, mimeType: 'image/jpeg' }
      });
    }
    parts.push({ text: `Subject: ${subject}. Question: ${question}` });

    const result = await model.generateContent({
      contents: [{ parts }],
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    
    const answer = result.response.text();

    // 4. Save to History
    await db.collection('questions').add({
      userId,
      question,
      answer,
      subject,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5. Update Usage
    await userRef.update({ dailyUsage: admin.firestore.FieldValue.increment(1) });

    res.json({ success: true, answer });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/

export const BACKEND_INFO = "This file contains the reference Node.js code.";