import { desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

export const getRoomDetailsRoute: FastifyPluginCallbackZod = (app) => {
	app.get(
		'/rooms/:roomId',
		{
			schema: {
				params: z.object({ roomId: z.uuid() }),
			},
		},
		async (request, reply) => {
			const { rooms } = schema
			const { roomId } = request.params

			const result = await db
				.select({
					id: rooms.id,
					name: rooms.name,
					description: rooms.description,
					createdAt: rooms.createdAt,
				})
				.from(rooms)
				.where(eq(rooms.id, roomId))
				.orderBy(desc(rooms.createdAt))
				.limit(1)

			const room = result[0]

			if (!room) {
				return reply.status(404).send({ error: 'Room not found' })
			}

			return room
		}
	)
}
