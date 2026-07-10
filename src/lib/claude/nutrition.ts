import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-sonnet-4-6'

function parseJSON<T>(raw: string): T {
  return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T
}

export interface MealItemEstimate {
  name: string
  quantity: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface MealEstimate {
  summary: string
  items: MealItemEstimate[]
  total: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
  confidence: 'low' | 'medium' | 'high'
  notes?: string
}

const ESTIMATE_RULES = `Rules:
- Break the meal into 2-6 individual items — never return just one combined item unless the photo/description truly shows a single uniform food (e.g. one apple).
- Be conservative and realistic, using standard nutrition data (USDA-style values) and typical restaurant/home-cooked portions.
- The "total" object MUST equal the exact sum of all items' values.
- Set confidence to "low" if the meal is unclear or a heavily mixed dish where portions are hard to judge; "medium" for a typical clear case; "high" only for simple, easily-measured foods.`

export async function estimateMealFromImage(
  base64Data: string,
  mediaType: string,
  textHint?: string
): Promise<MealEstimate> {
  const safe = (['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as string[]).includes(mediaType)
    ? mediaType
    : 'image/jpeg'

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 900,
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
          text: `You are a nutritionist analysing a photo of a meal. Identify each distinct food item visible (be specific: "grilled chicken breast" not just "chicken"). For each item, estimate a realistic portion size and its calories, protein, carbs, and fat in grams.

${ESTIMATE_RULES}
${textHint ? `\nAdditional context from the user: "${textHint}"` : ''}

Return ONLY this JSON (no markdown, no commentary):
{
  "summary": "Short 3-6 word description of the whole meal",
  "items": [
    {"name": "Grilled chicken breast", "quantity": "150g", "calories": 248, "protein_g": 46, "carbs_g": 0, "fat_g": 5},
    {"name": "White rice", "quantity": "1 cup cooked", "calories": 205, "protein_g": 4, "carbs_g": 45, "fat_g": 0}
  ],
  "total": {"calories": 453, "protein_g": 50, "carbs_g": 45, "fat_g": 5},
  "confidence": "medium",
  "notes": "optional one-sentence caveat, omit this field entirely if none"
}`,
        },
      ],
    }],
  })

  const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '{}'
  return parseJSON<MealEstimate>(text)
}

export async function estimateMealFromText(description: string): Promise<MealEstimate> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    system: 'You are a nutritionist. Respond with valid JSON ONLY — no markdown.',
    messages: [{
      role: 'user',
      content: `The user describes a meal in their own words: "${description}"

Break it into individual food items and estimate calories, protein, carbs, and fat in grams for each. If a quantity isn't specified, assume a typical single-serving portion and note that assumption in "notes".

${ESTIMATE_RULES}

Return ONLY this JSON:
{
  "summary": "Short 3-6 word description of the whole meal",
  "items": [
    {"name": "...", "quantity": "...", "calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0}
  ],
  "total": {"calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0},
  "confidence": "medium",
  "notes": "optional one-sentence caveat, omit this field entirely if none"
}`,
    }],
  })

  const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '{}'
  return parseJSON<MealEstimate>(text)
}
