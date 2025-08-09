import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { generateEmbeddings, transcribeAudio } from '../../services/gemini.ts'

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
	app.post(
		'/rooms/:roomId/audio',
		{
			schema: {
				params: z.object({
					roomId: z.string().uuid('Invalid roomId format'),
				}),
			},
		},
		async (request, reply) => {
			try {
				const { roomId } = request.params
				const audio = await request.file()

				if (!audio) {
					return reply.status(400).send({ error: 'Audio file is required' })
				}

				if (
					!['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm'].includes(
						audio.mimetype
					)
				) {
					return reply.status(400).send({ error: 'Unsupported audio format' })
				}

				const roomExists = await db
					.select()
					.from(schema.rooms)
					.where(eq(schema.rooms.id, roomId))
					.limit(1)

				if (roomExists.length === 0) {
					return reply.status(404).send({ error: 'Room not found' })
				}

				const audioBuffer = await audio.toBuffer()
				const audioAsBase64 = audioBuffer.toString('base64')

				let transcription: string
				try {
					transcription = await transcribeAudio(audioAsBase64, audio.mimetype)
				} catch (err) {
					app.log.error(err, 'Error transcribing audio')
					return reply.status(500).send({ error: 'Failed to transcribe audio' })
				}

				let embeddings: number[]
				try {
					embeddings = await generateEmbeddings(transcription)
				} catch (err) {
					app.log.error(err, 'Error generating embeddings')
					return reply
						.status(500)
						.send({ error: 'Failed to generate embeddings' })
				}

				const result = await db
					.insert(schema.audioChunks)
					.values({
						roomId,
						transcription,
						embeddings,
					})
					.returning()

				const chunk = result[0]
				if (!chunk) {
					return reply
						.status(500)
						.send({ error: 'Failed to insert audio chunk' })
				}

				return reply.status(201).send({ chunkId: chunk.id })
			} catch (err) {
				app.log.error(err)
				return reply.status(500).send({ error: 'Internal server error' })
			}
		}
	)
}
