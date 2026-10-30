# Website feedback — October 29, 2026

Sandra's review of harf.media, item by item. `[x]` = done and checked on the site,
`[ ]` = open, `[?]` = needs a decision. Everything marked done is live on https://harf.media.

## 1. Homepage — text
- [x] Headline: "A Living Memory of the AI Transition"
- [x] Keep "We are experiencing a transformation we do not yet fully understand."
- [x] Keep "How is AI changing the way you think, learn, work, and feel?"
- [x] Replace the "A founding inquiry…" line with "Documenting how artificial intelligence is reshaping the way we think, learn, work, and relate to one another — as the transformation unfolds."
- [x] Never describe HARF as an "initiative"
- [x] Remove repetitive paragraphs while keeping the main ideas
- [x] Keep "What people believed before they knew what happened cannot be reconstructed later."

## 2. Homepage — background image
- [x] Library photo restored
- [x] Headline clearly readable; enough text contrast
- [x] Cropped properly on mobile

## 3. Homepage — invitation to participate
- [x] Add "Tell us what AI is changing in your life."
- [x] Add "Your experience today could help us understand what changed tomorrow."
- [x] Three distinct options with the new descriptions
- [x] Estimated time for each option
- [x] No competing messages around them

## 4. Share your experience — opening
- [x] Opening question "Have you noticed AI changing the way you think?" with the 5 answers, one selection
- [x] Follow-up "Can you remember a moment when you first noticed this?" (open text)
- [x] Main question asks for a specific moment
- [x] Existing structure kept; form not longer (follow-up appears only after an answer is picked)

## 5. Take the survey
- [x] Tally questionnaire unchanged (questions, fields, data structure)
- [x] Only usability fixes on our page

## 6. After submission
- [x] Thank-you text after a story
- [x] Same thank-you after the survey (detected from the Tally embed)
- [x] Editorial reflection: "What if the most important change isn't what AI can do, but what you no longer do without it?"

## 7. Six-month follow-up
- [x] "Would you like to revisit your answers in six months?" with supporting text
- [x] Optional email field
- [x] Separate consent checkbox for future contact
- [x] Securely linked to the original submission (participant code), no account
- [x] No automated emails; stored with a "remind after" date

## 8. About — editorial positioning
- [x] Keep "HARF begins where the headline ends."
- [x] "Not what AI can do, but what happens to people while it happens." made prominent, right after the intro
- [x] Keep the "researcher in 2035" passage
- [x] Presented as an evolving archive (journalism, research, comparative studies), not an institution or observatory

## 9. About — fourth dimension
- [x] Add "Inform" in the same format as Document, Return and Preserve

## 10. About — founder
- [x] "Founded by Sandra Boccia" with the biography as written
- [ ] Photograph: placeholder with initials until Sandra sends the file
- [x] Discreet, editorial presentation
- [x] Nothing that suggests an official Harvard project. Accent color kept for now (decided Oct 29); see notes

## 11. Question of the Week
- [x] Prominent and easy to find
- [x] Updatable from the dashboard without code (already possible)
- [x] Clicking the question opens the response field with the question shown
- [x] Each response stored with the question, its week and the date
- [x] Current question set to Sandra's example

## 12. Archive
- [x] Keep the eight themes
- [x] Remove all fictional stories from the public site
- [x] Editors can hand-pick featured excerpts for the homepage

## 13. Privacy and consent
- [x] Explains why experiences are collected
- [x] Explains how responses are stored and used
- [x] Explains whether excerpts may be published
- [x] Explains contributing without public attribution
- [x] Explains how to request withdrawal or deletion (with a way to do it)
- [x] Participation, publication and future contact consents kept separate
- [x] Identifiable information never published without explicit permission
- [x] Clear, reassuring language; no accounts

## 14. Basic analytics
- [x] Traffic: visitors, sources, mobile vs desktop
- [x] Participation: Share clicks, Survey clicks, story starts, survey starts, completed stories, completed surveys, abandonment
- [x] Engagement: archive visits, Question of the Week interactions, six-month opt-ins, returning visitors
- [x] Stories and survey responses counted separately
- [x] Simple view in the dashboard, not a complex dashboard

## 15. Footer
- [x] Replace with "© 2026 HARF — Human Agency, Reasoning & Futures"
- [x] Keep the footer minimal

## 16. Not built (by request)
User accounts, forums, public profiles, complex dashboards, AI personality assessments,
an observatory section, automated reports, recommendation systems, automated editorial analysis.

## Notes

- **Harvard look (item 10).** Nothing on the site uses Harvard's name, crest or logo outside Sandra's biography.
  But the accent red (`#a51c30`) is Harvard's official crimson, and next to the navy and serif type it could
  read as Harvard branding. Decision (Oct 29): keep it for now and revisit with the visual identity. It's one value in `globals.css`.
- **Founder photo (item 10).** Save it as `public/founder.jpg` and replace the "SB" placeholder in
  `src/app/about/page.tsx`.
- **Survey six-month opt-in (item 7).** After the survey, people can leave an email for the six-month invitation.
  It can't be tied to their Tally answers without adding a hidden field to the Tally form, which changes its data
  structure, so that waits for Sandra's go-ahead. Story opt-ins are tied to the story through the participant code.
- **Survey fields (item 5).** The Tally form wasn't edited. Whether it already asks country, age range and main AI
  context is for Sandra to confirm in Tally.
- **Estimated times (item 3).** Survey "About 5–7 min" comes from the Tally form's own introduction. Story
  "About 5–10 min" is an estimate for the opening question, the story and the optional context.
- **Analytics (item 14).** Anonymous and first-party: a random ID in the browser, no IP addresses, no third parties,
  and nothing sent when Do Not Track or Global Privacy Control is on. Events expire after 13 months. "Survey
  started" means the person reached page 2 of the Tally form. Counts begin from this release. Ad blockers and
  people who open Tally directly aren't counted.
- **Fictional stories (item 12).** All sample testimonies and excerpts were deleted from the live database.
  `npm run seed` now creates private test testimonies only and never publishes anything.
- **Withdrawal (item 13).** The privacy page has a removal form: participant code (optional), a description and an
  optional reply email. Requests appear in the dashboard under "Withdrawal requests"; an editor deletes the
  testimony and marks the request done.
- **Consent version** is now `2026-10-29.v3`: the interview consent was reworded and the six-month invitation added.
