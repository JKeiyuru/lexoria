import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@lexoria/database'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ── Mentor characters per subject ─────────────────────────────────
const MENTOR_CHARACTERS: Record<string, { name: string; personality: string }> = {
  javascript: {
    name: 'Syntara',
    personality: 'a wise architect of the City of Logic. You speak with calm authority, using city and building metaphors. You care deeply about the student\'s growth.',
  },
  mathematics: {
    name: 'Axiom',
    personality: 'a ancient guardian of the Infinite Citadel. You speak with precision and elegance, finding beauty in patterns and proofs.',
  },
  biology: {
    name: 'Vira',
    personality: 'a spirited explorer of the Living Realm. You speak with wonder and curiosity, using nature and organism metaphors.',
  },
  physics: {
    name: 'Newton',
    personality: 'a powerful mage of the Force Fields. You speak dramatically about forces and energy, treating physics laws as magical spells.',
  },
  chemistry: {
    name: 'Alca',
    personality: 'a mysterious alchemist of the Crucible. You speak with mystical flair, treating reactions and elements as potions and ingredients.',
  },
  genetics: {
    name: 'Helix',
    personality: 'a code-reader from the Code of Life. You speak with quiet intensity, treating DNA as the ultimate programming language.',
  },
}

const DEFAULT_MENTOR = {
  name: 'Lexus',
  personality: 'a wise and encouraging guide across all subjects. You are supportive, clear, and always focused on helping the student understand.',
}

// ── Build system prompt ───────────────────────────────────────────
const buildSystemPrompt = (
  subjectSlug: string,
  mode: 'STORY' | 'TECHNICAL',
  chapterTitle: string,
  concept: string
): string => {
  const mentor = MENTOR_CHARACTERS[subjectSlug] || DEFAULT_MENTOR

  const storyPrompt = `You are ${mentor.name}, ${mentor.personality}

You are helping a student who is currently in "${chapterTitle}", learning about "${concept}".

You speak in character at all times. Keep responses short — 3 to 5 sentences maximum. 
Give ONE concrete hint that moves the student forward without giving away the full answer.
End with a brief encouraging sentence in character.
Never use bullet points or markdown. Speak naturally.`

  const technicalPrompt = `You are ${mentor.name}, an expert tutor helping a student learn "${concept}" in the context of "${chapterTitle}".

Keep responses short — 3 to 5 sentences maximum.
Give ONE clear, specific technical hint. Reference the exact concept they are struggling with.
Do not give away the full solution. Guide them to figure it out themselves.
Be encouraging but direct. No markdown, no bullet points.`

  return mode === 'STORY' ? storyPrompt : technicalPrompt
}

// ── Get a hint for a challenge ────────────────────────────────────
export const getMentorHint = async (
  userId: string,
  challengeId: string,
  userCode: string,
  errorMessage: string,
  mode: 'STORY' | 'TECHNICAL'
) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      chapter: {
        include: {
          season: {
            include: { subject: true },
          },
        },
      },
    },
  })

  if (!challenge) throw new Error('CHALLENGE_NOT_FOUND')

  const subject = challenge.chapter.season.subject
  const mentor = MENTOR_CHARACTERS[subject.slug] || DEFAULT_MENTOR

  const userMessage = `
The student is working on this challenge:
"${challenge.prompt}"

Their current code:
\`\`\`
${userCode || '(no code written yet)'}
\`\`\`

${errorMessage ? `Error they received: "${errorMessage}"` : 'They have not run the code yet or got no output.'}

Give them a helpful hint without revealing the solution.
`.trim()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: buildSystemPrompt(
      subject.slug,
      mode,
      challenge.chapter.title,
      challenge.chapter.conceptTaught
    ),
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as any).text)
    .join('')

  return {
    mentorName: mentor.name,
    hint: text,
    subjectSlug: subject.slug,
  }
}

// ── Explain a concept in plain language ───────────────────────────
export const getMentorExplanation = async (
  userId: string,
  chapterId: string,
  question: string,
  mode: 'STORY' | 'TECHNICAL'
) => {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      season: { include: { subject: true } },
    },
  })

  if (!chapter) throw new Error('CHAPTER_NOT_FOUND')

  const subject = chapter.season.subject
  const mentor = MENTOR_CHARACTERS[subject.slug] || DEFAULT_MENTOR

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: buildSystemPrompt(
      subject.slug,
      mode,
      chapter.title,
      chapter.conceptTaught
    ),
    messages: [
      {
        role: 'user',
        content: `The student asks: "${question}"\n\nAnswer their question clearly and concisely in your character voice. Max 4 sentences.`,
      },
    ],
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as any).text)
    .join('')

  return {
    mentorName: mentor.name,
    response: text,
    subjectSlug: subject.slug,
  }
}

// ── Celebrate a win ───────────────────────────────────────────────
export const getMentorCelebration = async (
  subjectSlug: string,
  chapterTitle: string,
  mode: 'STORY' | 'TECHNICAL'
) => {
  const mentor = MENTOR_CHARACTERS[subjectSlug] || DEFAULT_MENTOR

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    system: buildSystemPrompt(subjectSlug, mode, chapterTitle, ''),
    messages: [
      {
        role: 'user',
        content: 'The student just passed a challenge! Give them a short, enthusiastic celebration message in character. Max 2 sentences.',
      },
    ],
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as any).text)
    .join('')

  return { mentorName: mentor.name, message: text }
}