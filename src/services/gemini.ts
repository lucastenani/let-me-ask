import { GoogleGenAI } from '@google/genai'
import { env } from '../env.ts'

const gemini = new GoogleGenAI({
	apiKey: env.GEMINI_API_KEY,
	// model: "gemini-1.5-flash",
	// baseUrl: "https://generativelanguage.googleapis.com/v1beta",
	// timeout: 10000, // Optional timeout in milliseconds
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
