import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';

export const classifications = pgTable('classifications', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  examples: text('examples'),
  usefulLinks: text('useful_links'),
  views: integer('views').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const softwareItems = pgTable('software_items', {
  id: serial('id').primaryKey(),
  classificationId: integer('classification_id').references(() => classifications.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: text('type').default('App').notNull(),
  objective: text('objective').notNull(),
  accessUrl: text('access_url').notNull(),
  licenseType: text('license_type').notNull(),
  releaseYear: integer('release_year').notNull(),
  author: text('author').notNull(),
  description: text('description'),
  videoUrl: text('video_url'),
  views: integer('views').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ratings = pgTable('ratings', {
  id: serial('id').primaryKey(),
  softwareItemId: integer('software_item_id').references(() => softwareItems.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(), // From Clerk
  score: integer('score').notNull(), // 1 to 5
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const classificationExamples = pgTable('classification_examples', {
  id: serial('id').primaryKey(),
  classificationId: integer('classification_id').references(() => classifications.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const classificationRatings = pgTable('classification_ratings', {
  id: serial('id').primaryKey(),
  classificationId: integer('classification_id').references(() => classifications.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(), // From Clerk
  score: integer('score').notNull(), // 1 to 5
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { AnyPgColumn } from 'drizzle-orm/pg-core';

export const forumThreads = pgTable('forum_threads', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // From Clerk
  title: text('title').notNull(),
  content: text('content').notNull(),
  classificationId: integer('classification_id').references(() => classifications.id, { onDelete: 'set null' }),
  softwareItemId: integer('software_item_id').references(() => softwareItems.id, { onDelete: 'set null' }),
  views: integer('views').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const forumThreadRatings = pgTable('forum_thread_ratings', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(), // From Clerk
  score: integer('score').notNull(), // 1 to 5
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const forumComments = pgTable('forum_comments', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(), // From Clerk
  content: text('content').notNull(),
  parentId: integer('parent_id').references((): AnyPgColumn => forumComments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  softwareItemId: integer('software_item_id').references(() => softwareItems.id, { onDelete: 'cascade' }).notNull(),
  visitDate: date('visit_date').notNull(), 
  count: integer('count').default(1).notNull(),
});
