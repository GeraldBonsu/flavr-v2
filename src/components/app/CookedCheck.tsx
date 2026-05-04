'use client'

import { useState, useEffect } from 'react'
import FeedbackModal from './FeedbackModal'

interface Props {
  recipeId: string
  recipeName: string
}

const SEEN_PREFIX = 'cooked_asked_'

export default function CookedCheck({ recipeId, recipeName }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const alreadyAsked = localStorage.getItem(SEEN_PREFIX + recipeId)
    if (!alreadyAsked) setShow(true)
  }, [recipeId])

  const handleClose = () => {
    localStorage.setItem(SEEN_PREFIX + recipeId, '1')
    setShow(false)
  }

  if (!show) return null

  // FeedbackModal already handles its own full-screen overlay
  return <FeedbackModal recipeId={recipeId} mode="cooked" onClose={handleClose} />
}
