import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

export const createRoomRoute: FastifyPluginCallbackZod = (app) => {
	app.post(
		'/rooms',
		{
			schema: {
				body: z.object({
					name: z.string().min(4, 'Name must be at least 4 characters long'),
					description: z.string().optional(),
				}),
			},
		},
		async (request, reply) => {
			try {
				const { rooms } = schema
				const { name, description } = request.body

				const result = await db
					.insert(rooms)
					.values({
						name,
						description,
					})
					.returning()

				const insertedRoom = result[0]
				if (!insertedRoom) {
					return reply.status(500).send({ error: 'Failed to create new room' })
				}

				return reply.status(201).send({ roomId: insertedRoom.id })
			} catch (err) {
				app.log.error(err)
				return reply.status(500).send({ error: 'Internal server error' })
			}
		}
	)
}
