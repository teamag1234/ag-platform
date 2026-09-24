import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const grantStatus = pgEnum('grant_status', ['active', 'revoked']);
export const grantSource = pgEnum('grant_source', ['kajabi_webhook', 'kajabi_sync', 'manual']);

/** Alumnos. Un alumno existe en cuanto Kajabi nos dice que ha comprado algo. */
export const students = pgTable(
  'students',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    name: text('name'),
    kajabiCustomerId: text('kajabi_customer_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('students_email_idx').on(t.email), index('students_kajabi_idx').on(t.kajabiCustomerId)],
);

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    thumbnailUrl: text('thumbnail_url'),
    kajabiCourseId: text('kajabi_course_id'),
    published: boolean('published').notNull().default(false),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('courses_slug_idx').on(t.slug)],
);

export const modules = pgTable(
  'modules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    position: integer('position').notNull().default(0),
    kajabiModuleId: text('kajabi_module_id'),
  },
  (t) => [index('modules_course_idx').on(t.courseId)],
);

export type Attachment = { title: string; url: string };

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    position: integer('position').notNull().default(0),
    /** GUID del vídeo en Bunny Stream. Null si la lección no tiene vídeo (o aún no se ha subido). */
    bunnyVideoId: text('bunny_video_id'),
    /** Contenido de la lección en HTML. Lo escribimos nosotros, no viene de usuarios. */
    bodyHtml: text('body_html'),
    attachments: jsonb('attachments').$type<Attachment[]>().notNull().default([]),
    published: boolean('published').notNull().default(true),
    kajabiLessonId: text('kajabi_lesson_id'),
  },
  (t) => [uniqueIndex('lessons_module_slug_idx').on(t.moduleId, t.slug)],
);

/** Acceso de un alumno a un curso. Lo concede Kajabi (webhook o conciliación), nunca se edita a mano en producción. */
export const grants = pgTable(
  'grants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    status: grantStatus('status').notNull().default('active'),
    source: grantSource('source').notNull(),
    kajabiPurchaseId: text('kajabi_purchase_id'),
    kajabiOfferId: text('kajabi_offer_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('grants_student_course_idx').on(t.studentId, t.courseId)],
);

export const progress = pgTable(
  'progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('progress_student_lesson_idx').on(t.studentId, t.lessonId)],
);

/** Enlaces mágicos. Guardamos solo el hash del token. */
export const magicLinks = pgTable(
  'magic_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('magic_links_token_idx').on(t.tokenHash), index('magic_links_email_idx').on(t.email)],
);

/** Mapeo oferta de Kajabi -> curso del aula. Una oferta puede dar acceso a varios cursos. */
export const kajabiOfferCourses = pgTable(
  'kajabi_offer_courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kajabiOfferId: text('kajabi_offer_id').notNull(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    note: text('note'),
  },
  (t) => [uniqueIndex('kajabi_offer_courses_idx').on(t.kajabiOfferId, t.courseId)],
);

/** Registro de webhooks recibidos, para auditoría e idempotencia. */
export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: text('provider').notNull(),
    eventType: text('event_type'),
    kajabiCustomerId: text('kajabi_customer_id'),
    email: text('email'),
    payload: jsonb('payload').notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    error: text('error'),
  },
  (t) => [index('webhook_events_received_idx').on(t.receivedAt)],
);
