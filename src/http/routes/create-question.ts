import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { generateAnswer, generateEmbeddings } from '../../services/gemini.ts'

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
	app.post(
		'/rooms/:roomId/questions',
		{
			schema: {
				params: z.object({ roomId: z.uuid() }),
				body: z.object({
					question: z.string().min(10),
				}),
			},
		},
		async (request, reply) => {
			try {
				const { questions, audioChunks } = schema
				const { question } = request.body
				const { roomId } = request.params

				let embeddings: number[]
				try {
					embeddings = await generateEmbeddings(question)
				} catch {
					return reply
						.status(500)
						.send({ error: 'Failed to generate embeddings' })
				}

				const embeddingsAsString = `[${embeddings.join(',')}]`

				const chunks = await db
					.select({
						id: audioChunks.id,
						transcription: audioChunks.transcription,
						similarity: sql<number>`1 - (${audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
					})
					.from(audioChunks)
					.where(
						and(
							eq(audioChunks.roomId, roomId),
							sql`1 - (${audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
						)
					)
					.orderBy(
						sql`${audioChunks.embeddings} <=> ${embeddingsAsString}::vector`
					)
					.limit(3)

				if (chunks.length === 0) {
					return reply
						.status(404)
						.send({ error: 'No relevant context found for the question' })
				}

				let answer: string
				try {
					const transcriptions = chunks.map((chunk) => chunk.transcription)
					answer = await generateAnswer(question, transcriptions)
				} catch {
					return reply
						.status(500)
						.send({ error: 'Failed to generate AI answer' })
				}

				const result = await db
					.insert(questions)
					.values({ roomId, question, answer })
					.returning()

				const insertedQuestion = result[0]
				if (!insertedQuestion) {
					return reply
						.status(500)
						.send({ error: 'Failed to create new question' })
				}

				return reply.status(201).send({ questionId: insertedQuestion.id })
			} catch {
				return reply.status(500).send({ error: 'Internal server error' })
			}
		}
	)
}
