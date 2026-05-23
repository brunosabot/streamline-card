---
name: changelog-generator
description: Generate an engaging, human-centric, and community-focused changelog from git history. Trigger this when the user asks for "what's new", "release notes", or "changelog". Inspired by the polished yet passionate styles of Streamline Card and Bubble Card.
---

# Changelog Generator

Your goal is to transform a cold list of git commits into a warm, narrative-driven update. It must feel like a sincere letter from a developer who is passionate about their work.

## Tone & Personality
- **Sincere & Grounded**: Avoid kitschy or "customer service" greetings. Be direct and sincere about the project.
- **Strictly Factual Context**: You MUST ask the user for personal context before finalizing the intro. Use their answer to make the intro more human. **DO NOT hallucinate or assume things.** Stick to the facts they provide.
- **Contextual Emojis**: Emojis must match the *content* of the change (e.g., 🔢 or ⚖️ for booleans, ⚡ for performance, 🎨 for UI).

## Steps

1. **Analyze History**: Read commits since the latest tag or between specific tags.
2. **Identify Themes**: Group changes into "🚀 What's New for You" and "🔧 Technical Polish & Stability".
3. **Ask for Context**: Ask the user for the "story" behind the release to include in the intro.
4. **Credit Contributors**: Identify all contributors mentioned in PRs or commit messages. **Exclude the project owner/maintainer (the user) from this list.**
5. **Draft the Narrative**: Write a two-paragraph intro that is sincere and incorporates the exact user context.

## Output Structure

1. **Greeting**: Always start with exactly: "Hello there!"
2. **The Personal Update**: 
   - **Paragraph 1**: A sincere opening incorporating the exact context provided by the user. Keep details fatuals.
   - **Paragraph 2**: A summary of what this specific release aims to achieve.
3. **🚀 What's New for You**: 
   - Use bullet points for features.
   - **EMOJI PLACEMENT IS CRITICAL**: The emoji MUST be placed at the very beginning of the bullet point, immediately after the dash. Example: `- 🎨 **New UI**: ...`
   - Use a diverse range of emojis that specifically represent the *nature* of the change.
4. **🔧 Technical Polish & Stability**:
   - **MUST BE A CONCISE LIST**: Use a bulleted list for these items. 
   - **SHORTER THAN FEATURES**: This section MUST be noticeably shorter and less detailed than the "What's New for You" section. 
   - Ruthlessly combine similar technical tasks into brief summaries.  Do not provide paragraphs of technical detail.
   - **No individual emojis** for bullet points in this section.
   - Briefly explain why the work matters to a human.
5. **❤️ Huge Thanks**:
   - **Contributor Recognition**: Write a **dedicated paragraph per contributor**.
   - **Exclude the Maintainer**: NEVER include the project owner/maintainer in the thanks credits.
   - **Bold Contributors**: Bold all contributor names (e.g., "**@user**").
   - Mention specifically what they helped with to make it personal.

## Formatting Guidelines
- **Intro Layout**: Blank line after the greeting and between intro paragraphs.
- **Emoji Consistency**: 
  - User Features: Diverse range of content-matching emojis placed AT THE VERY BEGINNING of the line.
  - Technical: No emojis for bullet points. Keep it strictly shorter than the User Features section.
  - Section Headers: 🚀 for User Features, 🔧 for Tech.
