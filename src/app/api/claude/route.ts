import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecipe, generateMealPlan, lookupRecipeIngredients } from '@/lib/claude/recipes'
import { lookupIngredient, analyzeIngredientsFromImage } from '@/lib/claude/ingredients'
import { estimateMealFromImage, estimateMealFromText } from '@/lib/claude/nutrition'
import { requirePremiumApi } from '@/lib/subscription/requirePremium'

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
      case 'lookupRecipeIngredients': {
        const result = await lookupRecipeIngredients(body.recipeName as string)
        return NextResponse.json(result)
      }
      case 'estimateMealFromImage': {
        const gate = await requirePremiumApi(user.id)
        if (gate) return gate
        const result = await estimateMealFromImage(
          body.base64 as string,
          body.mediaType as string,
          body.textHint as string | undefined
        )
        return NextResponse.json(result)
      }
      case 'estimateMealFromText': {
        const gate = await requirePremiumApi(user.id)
        if (gate) return gate
        const result = await estimateMealFromText(body.description as string)
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
