export const protectedChatWarning =
  "To keep your order protected, communication must stay on Giftra"

const contactPatterns = [
  /\b(?:\+?\d[\s().-]?){10,}\b/,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  /(^|\s)@[a-zA-Z0-9_]{1,30}\b/,
  /\b(?:wa\.me|whatsapp|telegram|signal)\b/i,
  /\b(?:phone|call|text|dm|instagram|insta|telegram|signal|whatsapp)\s*:?\s*\S+/i,
]

export function containsContactInfo(text: string) {
  return contactPatterns.some((pattern) => pattern.test(text))
}

export function validateChatMessage(text: string) {
  const trimmed = text.trim()

  if (!trimmed) {
    return { valid: false, reason: "Message cannot be empty." }
  }

  if (containsContactInfo(trimmed)) {
    return { valid: false, reason: protectedChatWarning }
  }

  return { valid: true, reason: null }
}
