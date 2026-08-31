# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Learning Session

A recorded training session with title, category, date, description, optional video URL, and published status. Sessions are the primary content units participants access.

A Learning Session owns its Learning Resources and Session Questions. Sessions can be filtered by category, date range, and search terms. Lifecycle: draft (unpublished), published, archived.

## Learning Resource

A downloadable file attached to a Learning Session. Each resource has a title, stored path, MIME type, and size. Resources are accessed only by authenticated, approved participants.

## Calendar Event

A scheduled event with title, start and end date-times, description, optional location, optional live broadcast URL, and configurable email reminders. Administrators create, edit, and delete events; participants view them.

Calendar Events support three reminder offsets: three days before, one day before, and fifteen minutes before. Each reminder is independently configurable. Reminders are sent to active, approved, email-verified participants and administrators at the calculated send time.

## Session Question

A question posted by an authenticated user within a Learning Session's Q&A tab. Each question has a title, optional details, and belongs to one user and one session.

Session Questions support upvoting through Session Question Votes. Authors can edit or delete their own questions; administrators can moderate all content.

## Session Answer

A response to a Session Question. Each answer has a body and belongs to one user and one question.

Session Answers support upvoting through Session Answer Votes. Authors can edit or delete their own answers; administrators can moderate all content.

## Participant

An approved user who can access sessions, materials, community content, and events. Participants self-register and await administrator approval before gaining access.

## Administrator

A user with full access to manage members, content, categories, courses, lessons, events, files, and permissions. All active administrators receive queued alerts when participants self-register.

## Moderator

A user with permissions to manage community content within assigned boundaries. Moderators can manage posts and comments but have more limited permissions than administrators.

## Access Status

The lifecycle state of a user's ability to access Lead Lab content: pending (registered, awaiting approval), active (approved, can access), or revoked (access removed, can be restored).

## Option B

The approved product direction: a private, self-hosted web application inspired by Skool, replacing SharePoint for the Lead Lab training program. Option B is the current baseline; other options are historical.

## ICM (Interpretable Context Methodology)

The delivery workflow methodology with five stages: Define, Design, Build, Measure, Learn. Each stage has one job, reads only its declared inputs, writes inspectable text handoffs, and stops at its review boundary.

## Run

A cycle-specific execution folder under `application/runs/` that contains artifacts from a single ICM cycle. Each run has a unique slug and never overwrites prior runs.

## Activity Log

A record of administrative actions on the system. Each log entry captures the actor, action, subject (polymorphic), and optional metadata for audit purposes.
