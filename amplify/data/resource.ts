import { a, defineData, type ClientSchema } from "@aws-amplify/backend";
import { submitTestimony } from "../functions/submit-testimony/resource";
import { editorial } from "../functions/editorial/resource";

/*
 * Data model
 *
 * Testimony      private. The original, unedited contribution plus context,
 *                consent record and editorial metadata. Created only by the
 *                submitTestimony function; editors can read it but can never
 *                change the original text, context or consent fields.
 * Contact        private, separate table. Only exists when the participant
 *                opted in to follow-up contact.
 *
 * Deletion goes through the removeTestimony function so a testimony never
 * leaves an orphaned contact record or public excerpt behind.
 * Excerpt        public. An edited, anonymized excerpt. Created only by the
 *                editorial function after it checks publication consent, and
 *                carries no reference back to the private testimony.
 * WeeklyQuestion public. The Question of the Week, managed by editors.
 *
 * Attached media live in S3 (see storage/resource.ts); a testimony stores
 * only their keys and metadata.
 *
 * Longitudinal participation: participants receive a private code. Only a
 * SHA-256 hash of it (participantRef) is stored, which links a person's
 * testimonies over time without identifying them.
 */

const editorsReadOnly = (allow: Parameters<Parameters<ReturnType<typeof a.string>["authorization"]>[0]>[0]) => [
  allow.group("ADMINS").to(["read"]),
];

const schema = a.schema({
  EditorialStatus: a.enum(["NEW", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED", "WITHDRAWN"]),
  Channel: a.enum(["OPEN", "WEEKLY_QUESTION"]),
  MediaItem: a.customType({
    key: a.string().required(),
    name: a.string(),
    contentType: a.string(),
    size: a.integer(),
  }),

  Testimony: a
    .model({
      // Immutable record of what the participant wrote and agreed to.
      submittedAt: a.datetime().required().authorization(editorsReadOnly),
      language: a.string().authorization(editorsReadOnly),
      originalText: a.string().required().authorization(editorsReadOnly),
      channel: a.ref("Channel").authorization(editorsReadOnly),
      promptId: a.string().authorization(editorsReadOnly),
      promptText: a.string().authorization(editorsReadOnly),
      weeklyQuestionId: a.id().authorization(editorsReadOnly),
      participantRef: a.string().required().authorization(editorsReadOnly),
      entryNumber: a.integer().authorization(editorsReadOnly),
      relationship: a.string().authorization(editorsReadOnly),
      fieldOfWork: a.string().authorization(editorsReadOnly),
      country: a.string().authorization(editorsReadOnly),
      aiUseFrequency: a.string().authorization(editorsReadOnly),
      feelings: a.string().array().authorization(editorsReadOnly),
      feelingsOther: a.string().authorization(editorsReadOnly),
      consentResearch: a.boolean().required().authorization(editorsReadOnly),
      consentPublish: a.boolean().required().authorization(editorsReadOnly),
      consentContact: a.boolean().required().authorization(editorsReadOnly),
      consentVersion: a.string().required().authorization(editorsReadOnly),
      consentRecordedAt: a.datetime().required().authorization(editorsReadOnly),
      contactId: a.id().authorization(editorsReadOnly),
      media: a.ref("MediaItem").array().authorization(editorsReadOnly),
      synthetic: a.boolean().authorization(editorsReadOnly),
      // Editorial layer. Kept apart from the original text.
      editorialStatus: a.ref("EditorialStatus").required(),
      themes: a.string().array(),
      editorNotes: a.string(),
      excerptDraft: a.string(),
      excerptId: a.id(),
      reviewedAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index("participantRef").sortKeys(["submittedAt"]).name("byParticipant").queryField("listTestimoniesByParticipant"),
    ])
    .authorization((allow) => [allow.group("ADMINS").to(["read", "update"])]),

  Contact: a
    .model({
      testimonyId: a.id().required(),
      participantRef: a.string().required(),
      name: a.string(),
      email: a.email(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.group("ADMINS").to(["read"])]),

  Excerpt: a
    .model({
      text: a.string().required(),
      themes: a.string().array(),
      participantCategory: a.string(),
      language: a.string(),
      contributedOn: a.date(),
      publishedAt: a.datetime().required(),
      synthetic: a.boolean(),
    })
    .authorization((allow) => [allow.guest().to(["read"]), allow.group("ADMINS").to(["read"])]),

  WeeklyQuestion: a
    .model({
      question: a.string().required(),
      introduction: a.string(),
      weekOf: a.date().required(),
      active: a.boolean().required(),
    })
    .authorization((allow) => [allow.guest().to(["read"]), allow.group("ADMINS")]),

  SubmitTestimonyResult: a.customType({
    testimonyId: a.id().required(),
    participantCode: a.string().required(),
    entryNumber: a.integer().required(),
  }),

  submitTestimony: a
    .mutation()
    .arguments({
      text: a.string().required(),
      language: a.string(),
      channel: a.string(),
      promptId: a.string(),
      weeklyQuestionId: a.id(),
      participantCode: a.string(),
      relationship: a.string(),
      fieldOfWork: a.string(),
      country: a.string(),
      aiUseFrequency: a.string(),
      feelings: a.string().array(),
      feelingsOther: a.string(),
      consentResearch: a.boolean().required(),
      consentPublish: a.boolean().required(),
      consentContact: a.boolean().required(),
      consentVersion: a.string().required(),
      contactName: a.string(),
      contactEmail: a.string(),
      mediaKeys: a.string().array(), // S3 keys under uploads/, from the browser upload
      website: a.string(), // honeypot: real people leave this empty
    })
    .returns(a.ref("SubmitTestimonyResult"))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(submitTestimony)),

  publishExcerpt: a
    .mutation()
    .arguments({
      testimonyId: a.id().required(),
      text: a.string().required(),
      themes: a.string().array(),
      participantCategory: a.string(),
    })
    .returns(a.ref("Excerpt"))
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(editorial)),

  // Permanent removal on a participant's request: deletes the testimony with its
  // contact record and any published excerpt.
  removeTestimony: a
    .mutation()
    .arguments({ testimonyId: a.id().required() })
    .returns(a.boolean())
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(editorial)),

  unpublishExcerpt: a
    .mutation()
    .arguments({ testimonyId: a.id().required() })
    .returns(a.boolean())
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(editorial)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});
