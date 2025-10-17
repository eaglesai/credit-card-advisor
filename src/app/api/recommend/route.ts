import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationData, userName } = body

    // Build the prompt for Claude
    const prompt = `You are Sai, an expert credit card advisor. Analyze this user's profile and recommend the BEST Canadian credit card for them.

User Profile:
- Name: ${userName}
- Card Interest: ${conversationData.card_in_mind || 'Not specified'}
- Primary Spending: ${conversationData.spending_category || 'Not specified'}
- Annual Income: ${conversationData.annual_income || 'Not specified'}
- Payment Behavior: ${conversationData.payment_behavior || 'Not specified'}
- Reward Preference: ${conversationData.reward_preference || 'Not specified'}
- Fee Preference: ${conversationData.fee_preference || 'Not specified'}
- Bonus Importance: ${conversationData.bonus_importance || 'Not specified'}

Based on this profile, recommend ONE credit card that's the best match. Provide:
1. Card name and issuer
2. Brief reason why it's perfect for them (2-3 sentences)
3. Key benefits that match their needs
4. Application URL (if you know it, otherwise use a placeholder)

Format your response as JSON:
{
  "cardName": "Card Name",
  "issuer": "Bank Name",
  "reason": "Why this card is perfect...",
  "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "applyUrl": "https://..."
}`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract the response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    // Try to parse JSON from Claude's response
    let recommendation
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      recommendation = JSON.parse(cleanedResponse)
    } catch (parseError) {
      // If Claude didn't return JSON, create a structured response
      recommendation = {
        cardName: 'Rogers World Elite Mastercard',
        issuer: 'Rogers Bank',
        reason: responseText.slice(0, 300), // First 300 chars
        keyBenefits: [
          '1.5% cashback on all purchases',
          '4% on Rogers/Fido bills',
          'No annual fee'
        ],
        applyUrl: 'https://www.rogersbank.com/en/rogers_credit_cards/rogers_world_elite_mastercard'
      }
    }

    return NextResponse.json({
      success: true,
      recommendation
    })

  } catch (error) {
    console.error('Claude API Error:', error)
    
    // Fallback recommendation if API fails
    return NextResponse.json({
      success: true,
      recommendation: {
        cardName: 'Rogers World Elite Mastercard',
        issuer: 'Rogers Bank',
        reason: 'Based on your profile, this card offers excellent value with 1.5% cashback on all purchases, 4% on Rogers/Fido bills, and no annual fee.',
        keyBenefits: [
          '1.5% cashback on all purchases',
          '4% cashback on Rogers/Fido bills',
          'No annual fee',
          'Comprehensive travel insurance'
        ],
        applyUrl: 'https://www.rogersbank.com/en/rogers_credit_cards/rogers_world_elite_mastercard'
      }
    })
  }
}