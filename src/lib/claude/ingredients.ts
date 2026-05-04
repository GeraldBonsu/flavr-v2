import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-sonnet-4-6'

function parseJSON<T>(raw: string): T {
  return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T
}

export interface IngredientInfo {
  name: string
  category: string
  region: string
  origin: string
  cultural: string
  benefits: string[]
  globalRecipes: string[]
}

export async function lookupIngredient(ingredient: string): Promise<IngredientInfo> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 900,
    system: 'You are a culinary historian and nutritionist. Respond with valid JSON ONLY — no markdown.',
    messages: [{
      role: 'user',
      content: `Educational info about: ${ingredient}
Return ONLY this JSON (no markdown):
{
  "name": "Proper name",
  "category": "e.g. Spice",
  "region": "e.g. South Asia",
  "origin": "2-3 sentences on origin and history.",
  "cultural": "2-3 sentences on cultural significance.",
  "benefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4"],
  "globalRecipes": ["Dish (Country)", "Dish (Country)", "Dish (Country)", "Dish (Country)"]
}`,
    }],
  })

  const text = msg.content[0]?.type === 'text' ? msg.content[0].text : ''
  return parseJSON<IngredientInfo>(text)
}

export async function analyzeIngredientsFromImage(
  base64Data: string,
  mediaType: string
): Promise<string[]> {
  const safe = (['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as string[]).includes(mediaType)
    ? mediaType
    : 'image/jpeg'

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: safe as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: base64Data,
          },
        },
        {
          type: 'text',
          text: 'List every food ingredient visible. Return ONLY a JSON array of strings e.g. ["chicken","garlic"]. Return [] if none.',
        },
      ],
    }],
  })

  const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '[]'
  return parseJSON<string[]>(text)
}
