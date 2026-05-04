import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-sonnet-4-6'

function parseJSON<T>(raw: string): T {
  return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T
}

export interface GeneratedRecipe {
  name: string
  emoji: string
  cookTime: string
  servings: number
  cuisine: string
  calories: number
  protein: string
  carbs: string
  fats: string
  ingredients: Array<{ item: string; amount: string; extra: boolean }>
  steps: string[]
  goalNote: string
}

export async function generateRecipe(params: {
  ingredients: string[]
  goal: string
  diet: string[]
}): Promise<GeneratedRecipe> {
  const dietStr = params.diet.length ? params.diet.join(', ') : 'none'

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: 'You are a professional chef and nutritionist. Respond with valid JSON ONLY — no markdown, no extra text.',
    messages: [{
      role: 'user',
      content: `Generate a recipe using: ${params.ingredients.join(', ')}.
Goal: ${params.goal}. Dietary restrictions: ${dietStr}.
Return ONLY this JSON (no markdown):
{
  "name": "Recipe Name",
  "emoji": "🍳",
  "cookTime": "25 mins",
  "servings": 2,
  "cuisine": "Mediterranean",
  "calories": 450,
  "protein": "35g",
  "carbs": "28g",
  "fats": "18g",
  "ingredients": [{"item": "chicken breast", "amount": "200g", "extra": false}],
  "steps": ["Step 1.", "Step 2.", "Step 3."],
  "goalNote": "Two sentences on why this recipe suits the ${params.goal} goal."
}`,
    }],
  })

  const text = msg.content[0]?.type === 'text' ? msg.content[0].text : ''
  return parseJSON<GeneratedRecipe>(text)
}

export interface MealPlan {
  avgKcal: number
  avgProtein: string
  totalMeals: number
  days: Array<{
    day: string
    meals: Array<{ type: string; label: string; name: string; kcal: number }>
  }>
}

export async function generateMealPlan(params: {
  goal: string
  diet: string[]
}): Promise<MealPlan> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: 'You are a professional nutritionist. Respond with valid JSON ONLY.',
    messages: [{
      role: 'user',
      content: `7-day meal plan for goal: ${params.goal}. Restrictions: ${params.diet.join(', ') || 'none'}.
Return ONLY this JSON (no markdown):
{
  "avgKcal": 2140,
  "avgProtein": "148g",
  "totalMeals": 21,
  "days": [
    {
      "day": "Monday",
      "meals": [
        {"type": "b", "label": "Breakfast", "name": "Meal name", "kcal": 420},
        {"type": "l", "label": "Lunch",     "name": "Meal name", "kcal": 510},
        {"type": "d", "label": "Dinner",    "name": "Meal name", "kcal": 580}
      ]
    }
  ]
}
(all 7 days)`,
    }],
  })

  const text = msg.content[0]?.type === 'text' ? msg.content[0].text : ''
  return parseJSON<MealPlan>(text)
}
