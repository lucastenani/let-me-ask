import { GoogleGenAI } from '@google/genai'
import { env } from '../env.ts'

const gemini = new GoogleGenAI({
	apiKey: env.GEMINI_API_KEY,
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
	const response = await gemini.models.generateContent({
		model,
		contents: [
			{
				text: 'Transcribe the audio into U.S. English. Be accurate and natural in your transcription. Use proper punctuation and break the text into paragraphs when appropriate.',
			},
			{ inlineData: { mimeType, data: audioAsBase64 } },
		],
	})

	if (!response.text) {
		throw new Error('Unable to convert the audio.')
	}

	return response.text
}

export async function generateEmbeddings(text: string) {
	const response = await gemini.models.embedContent({
		model: 'text-embedding-004',
		contents: [{ text }],
		config: {
			taskType: 'RETRIEVAL_DOCUMENT',
		},
	})

	if (!response.embeddings?.[0].values) {
		throw new Error('Unable to generate embeddings.')
	}

	return response.embeddings[0].values
}

export async function generateAnswer(
	question: string,
	transcriptions: string[]
) {
	const context = transcriptions.join('\n\n')

	const prompt = `
    Based on the text provided below as context, answer the question clearly and accurately in U.S. English.
  
    CONTEXT:
    ${context}

    QUESTION:
    ${question}

    INSTRUCTIONS:
    - Use only information contained in the provided context;
    - If the answer cannot be found in the context, simply respond that there is not enough information to answer;
    - Be objective;
    - Maintain an educational and professional tone;
    - Cite relevant excerpts from the context when appropriate;
    - If citing the context, use the term "lesson content";
  `.trim()

	const response = await gemini.models.generateContent({
		model,
		contents: [
			{
				text: prompt,
			},
		],
	})

	if (!response.text) {
		throw new Error('Failed to generate answer with Gemini')
	}

	return response.text
}
