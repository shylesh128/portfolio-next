# Personal Portfolio

This is my personal portfolio showcasing my projects, skills, and experiences.

## Table of Contents

*   [About](#about)
*   [Projects](#projects)
*   [Skills](#skills)
*   [Experience](#experience)
*   [Contact](#contact)

## About

In this section, provide a brief introduction about yourself and your background. Talk about your passion for programming, your interests, and any other relevant information you would like to share.

## Projects

List and describe the projects you have worked on. Include details such as the project name, a brief description, technologies used, and any notable achievements or outcomes. You can also include screenshots or links to the live demos or repositories of your projects.

## Skills

Outline the programming languages, frameworks, tools, or other relevant skills you possess. Provide a brief description of each skill and your proficiency level. You can use a scale such as beginner, intermediate, or advanced.

*   JavaScript (Advanced)
*   Python (Intermediate)
*   HTML/CSS (Advanced)
*   React.js (Advanced)
*   Node.js (Intermediate)
*   SQL (Intermediate)

## Experience

List your previous work experiences related to programming, internships, or any other relevant positions. Include the company name, your job title, and a brief description of your responsibilities and achievements.

Company: XYZ Software

*   Job Title: Software Developer
*   Description: Developed web applications using React.js and integrated APIs for data retrieval. Collaborated with a team of developers to deliver high-quality software within tight deadlines.

Company: ABC Startup

*   Job Title: Intern
*   Description: Assisted in front-end development tasks and conducted unit testing. Participated in code reviews and gained practical experience in an agile development environment.

## Contact

Provide your contact information, such as your email address, LinkedIn profile, or any other preferred method of communication. Encourage visitors to reach out to you for collaborations, job opportunities, or any other inquiries.

*   Email: example@example.com
*   LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/yourname)

Feel free to reach out to me. I'm always open to new opportunities and collaborations!

## First-party analytics

The portfolio records a focused set of first-party events: page and section views, navigation, theme changes, project visits, GitHub and LinkedIn clicks, resume downloads, and contact-form starts/submissions. Events are sent in small batches to `POST /api/analytics/events`.

The private dashboard is available at `/admin/analytics` and presents overview metrics, sources, devices, countries, pages, sections, meaningful actions, recent sessions, and recent event activity. It also has a protected JSON equivalent at `/api/analytics/summary`.

### Privacy model

*   Raw IP addresses are not stored for analytics or new contact submissions. The server creates a keyed HMAC visitor hash from the request address; the secret never reaches the browser.
*   Full user-agent strings and full referrer URLs are not retained. Analytics stores broad browser/OS/device categories and a referrer domain only.
*   Contact-form values are never added to analytics events.
*   The client respects Do Not Track and Global Privacy Control signals.
*   MongoDB TTL indexes expire sessions and events. The default retention period is 180 days.

Existing historical contact records that already contain an `ip` field are intentionally left untouched; remove them through a separate, reviewed data-retention migration if needed.

### Environment variables

Copy `.env.example` to `.env.local` for local development. In Vercel, add the same values through the project environment settings; do not use a `NEXT_PUBLIC_` prefix for any of them.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | Existing MongoDB connection string. |
| `ANALYTICS_HASH_SECRET` | Yes | A random value of at least 32 characters used for non-reversible visitor hashing. Rotating it resets visitor grouping. |
| `ANALYTICS_DASHBOARD_USER` | Yes | Basic-auth username for the dashboard and summary endpoint. |
| `ANALYTICS_DASHBOARD_PASSWORD` | Yes | Strong Basic-auth password for the dashboard and summary endpoint. |
| `ANALYTICS_RETENTION_DAYS` | No | Retention in days, from 1 through 730; defaults to `180`. |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_EMAIL` | For email | Existing contact-notification settings. |

The analytics write endpoint is protected by a MongoDB-backed fixed-window limiter of 120 accepted events per pseudonymous visitor per minute. Client batches are capped at 20 events and request bodies at 32 KB.
