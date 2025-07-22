import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const rooms = pgTable('rooms', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text(),
	createdAt: timestamp().defaultNow().notNull(),
})
