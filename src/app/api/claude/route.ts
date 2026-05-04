import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecipe, generateMealPlan } from '@/lib/claude/recipes'
import { lookupIngredient, analyzeIngredientsFromImage } from '@/lib/claude/ingredients'

export async function POST(request: Request) {
  // Verify auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      action: string
      [key: string]: unknown
    }

    switch (body.action) {
      case 'generateRecipe': {
        const result = await generateRecipe({
          ingredients: body.ingredients as string[],
          goal:        body.goal as string,
          diet:        (body.diet as string[]) ?? [],
        })
        return NextResponse.json(result)
      }
      case 'generateMealPlan': {
        const result = await generateMealPlan({
          goal: body.goal as string,
          diet: (body.diet as string[]) ?? [],
        })
        return NextResponse.json(result)
      }
      case 'lookupIngredient': {
        const result = await lookupIngredient(body.ingredient as string)
        return NextResponse.json(result)
      }
      case 'analyzeImage': {
        const result = await analyzeIngredientsFromImage(
          body.base64 as string,
          body.mediaType as string
        )
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    console.error('[claude route]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
