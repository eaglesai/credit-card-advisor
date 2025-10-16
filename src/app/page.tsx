'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [step, setStep] = useState<'landing' | 'consent' | 'chat' | 'thankyou'>('landing')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [messages, setMessages] = useState<Array<{role: 'bot' | 'user', text: string}>>([])
  const [currentInput, setCurrentInput] = useState('')
  const [conversationData, setConversationData] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showPrivacy, setShowPrivacy] = useState(false)

  // Get user IP (simplified - in production use a proper API)
  const getUserIP = () => '0.0.0.0' // Placeholder

  const handleStartChat = () => {
    setStep('consent')
  }

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName || !userEmail || !consent) {
      alert('Please fill all fields and accept terms')
      return
    }
    
    // Save initial user data
    const { error } = await supabase
      .from('user_conversations')
      .insert({
        user_name: userName,
        user_email: userEmail,
        user_ip: getUserIP(),
        consent_given: consent,
        conversation_data: {}
      })

    if (error) {
      console.error('Error saving user data:', error)
      alert('Error starting chat. Please try again.')
      return
    }

    setStep('chat')
    setCurrentQuestion(0)
    setMessages([
      { role: 'bot', text: `Hi ${userName}, my name is Sai - your AI assistant. How are you doing today? 😊` },
      { role: 'bot', text: `                      I&apos;m here to help you find the perfect credit card! What card do you have in mind, or are you exploring options?` }
    ])
  }

  const getNextQuestion = (questionNum: number) => {
    const questions = [
      "Great! What is your primary spending category? (e.g., groceries, gas, travel, dining, or general purchases)",
      "Perfect! What is your approximate annual income? (e.g., $40K, $60K, $80K, $100K+)",
      "Understood. Do you typically pay your balance in full each month, or do you carry a balance?",
      "Good to know! Are you interested in cashback rewards, travel points, or other specific benefits?",
      "Excellent! Do you have any preference for annual fees? (e.g., no fee, willing to pay for premium benefits)",
      "Last question! How important is a welcome bonus or signup offer to you? (very important, somewhat, not important)"
    ]
    return questions[questionNum] || null
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return

    const userMessage = currentInput
    const newMessages = [...messages, { role: 'user' as const, text: userMessage }]
    setMessages(newMessages)
    setCurrentInput('')

    // Store the answer
    const questionKeys = [
      'card_in_mind',
      'spending_category', 
      'annual_income', 
      'payment_behavior', 
      'reward_preference', 
      'fee_preference',
      'bonus_importance'
    ]
    
    const updatedData = {
      ...conversationData,
      [questionKeys[currentQuestion]]: userMessage
    }
    setConversationData(updatedData)

    // Check if we should ask next question or finish
    if (currentQuestion < 6) {
      const nextQ = getNextQuestion(currentQuestion)
      if (nextQ) {
        setTimeout(() => {
          setMessages([...newMessages, { role: 'bot', text: nextQ }])
          setCurrentQuestion(currentQuestion + 1)
        }, 500)
      }
    } else {
      // All questions answered - process recommendation
      await processRecommendation(updatedData)
    }
  }

  const processRecommendation = async (data: Record<string, string>) => {
    // Show processing message
    setMessages(prev => [...prev, { 
      role: 'bot', 
      text: '🤔 Analyzing your responses and finding the best match for you...' 
    }])

    // Simulate AI processing (will be replaced with actual AI later)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simple recommendation logic (will be replaced with Claude/OpenAI API)
    const recommendedCard = 'Rogers World Elite Mastercard'
    const reason = `Based on your responses, the Rogers World Elite Mastercard is an excellent match for you. It offers 1.5% cashback on all purchases, 4% on Rogers/Fido bills, with no annual fee. This aligns perfectly with your spending habits and income level.`
    const applyUrl = 'https://www.rogersbank.com/en/rogers_credit_cards/rogers_world_elite_mastercard'

    // Save to database
    const { error } = await supabase
      .from('user_conversations')
      .update({
        conversation_data: data,
        recommended_card_name: recommendedCard,
        recommendation_reason: reason
      })
      .eq('user_email', userEmail)

    if (error) {
      console.error('Error saving recommendation:', error)
    }

    // TODO: Send email via Resend API (we'll add this later)
    // For now, just simulate email sent
    console.log('Email would be sent to:', userEmail)
    console.log('Card:', recommendedCard)
    console.log('Reason:', reason)
    console.log('Apply URL:', applyUrl)

    // Show final message and move to thank you
    setMessages(prev => [...prev, { 
      role: 'bot', 
              text: `✅ Perfect! I&apos;ve analyzed your needs and found the ideal credit card for you.\n\n📧 I&apos;ve sent a detailed recommendation with the card details and application link to ${userEmail}.\n\nPlease check your email (including spam folder) for the full recommendation!`  
    }])

    // Move to thank you screen after 2 seconds
    setTimeout(() => {
      setStep('thankyou')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Enhanced Artistic Background - More Visible Credit Card Mosaic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-40 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg rotate-12 transform shadow-2xl"></div>
        <div className="absolute top-40 right-20 w-72 h-44 bg-gradient-to-br from-teal-500 to-teal-400 rounded-lg -rotate-6 transform shadow-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-56 h-36 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg rotate-3 transform shadow-2xl"></div>
        <div className="absolute bottom-40 right-1/3 w-60 h-38 bg-gradient-to-br from-teal-600 to-teal-500 rounded-lg -rotate-12 transform shadow-2xl"></div>
        <div className="absolute top-1/3 left-1/2 w-64 h-40 bg-gradient-to-br from-blue-900 to-teal-500 rounded-lg rotate-45 transform shadow-2xl"></div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-48 h-32 border-4 border-blue-400 rounded-lg rotate-[-15deg] transform"></div>
        <div className="absolute bottom-1/3 left-1/3 w-52 h-34 border-4 border-teal-400 rounded-lg rotate-[25deg] transform"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">💳</span>
            </div>
            <h1 className="text-2xl font-bold text-blue-900">Credit Card Advisor Info</h1>
          </div>
          <nav className="text-sm text-[#1565C0] font-medium">
            <button className="hover:text-teal-500 transition">About</button>
          </nav>
        </div>
      </header>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Privacy Policy & Terms</h2>
            <div className="space-y-4 text-[#1565C0]">
              <p><strong>Educational Purpose:</strong> This tool provides informational recommendations only and is not financial advice.</p>
              <p><strong>Data Collection:</strong> We collect your name, email, IP address, and conversation data to provide personalized recommendations.</p>
              <p><strong>Data Usage:</strong> Your data may be used for AI training and improving our service quality.</p>
              <p><strong>No Liability:</strong> We are not responsible for any financial decisions made based on our recommendations.</p>
              <p><strong>Contact:</strong> For questions, contact us at support@creditcardadvisor.com</p>
            </div>
            <button
              onClick={() => setShowPrivacy(false)}
              className="mt-6 w-full bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-6 py-12">
        
        {/* Landing Page */}
        {step === 'landing' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-blue-900">
                Find Your Perfect Credit Card
              </h2>
              <p className="text-xl text-[#1565C0]">
                Smart AI-powered recommendations in minutes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-bold text-blue-900 mb-2">AI-Powered</h3>
                <p className="text-[#1565C0] text-sm">Smart recommendations based on your needs</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-bold text-blue-900 mb-2">Quick & Easy</h3>
                <p className="text-[#1565C0] text-sm">Get results in under 2 minutes</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-bold text-blue-900 mb-2">Personalized</h3>
                <p className="text-[#1565C0] text-sm">Tailored to your spending habits</p>
              </div>
            </div>

            <button
              onClick={handleStartChat}
              className="mt-8 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Chat 💬
            </button>
          </div>
        )}

        {/* Consent Form */}
        {step === 'consent' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Lets Get Started
              </h2>
              
              <form onSubmit={handleConsentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1565C0] mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none transition text-[#1565C0]"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1565C0] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none transition text-[#1565C0]"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                      required
                    />
                    <span className="text-sm text-[#1565C0]">
                      I understand this is an educational tool providing informational recommendations only, not financial advice. 
                      I consent to my data being stored for providing recommendations. 
                      <button
                        type="button"
                        onClick={() => setShowPrivacy(true)}
                        className="text-teal-500 hover:underline ml-1 font-semibold"
                      >
                        View Privacy Policy
                      </button>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
                >
                  Continue to Chat
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {step === 'chat' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-900 to-teal-500 text-white p-4">
                <h3 className="font-bold text-lg">Chat with Sai - Your AI Assistant</h3>
                <p className="text-sm text-blue-100">Finding your perfect credit card match...</p>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-sm px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-900 text-white'
                          : 'bg-white text-[#1565C0] border border-gray-200 shadow-sm'
                      }`}
                    >
                      {msg.role === 'bot' && <span className="text-2xl mr-2">🤖</span>}
                      <span className="whitespace-pre-line">{msg.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-[#1565C0]"
                    placeholder="Type your answer..."
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thank You Page */}
        {step === 'thankyou' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-xl p-12 border border-gray-200">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                Recommendation Sent!
              </h2>
              <p className="text-lg text-[#1565C0] mb-6">
                Thank you for using Credit Card Advisor Info, {userName}!
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
                <p className="text-[#1565C0]">
                  📧 We&apos;ve sent your personalized credit card recommendation to <strong>{userEmail}</strong>
                </p>
                <p className="text-sm text-[#1565C0] mt-2">
                  Please check your inbox (and spam folder) for the full details and application link.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Help Someone Else Find Their Card
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative text-center py-8 text-sm text-[#1565C0] border-t border-gray-200 mt-12">
        <p>
          © 2025 Credit Card Advisor Info | Educational purposes only | Not financial advice
        </p>
      </footer>
    </div>
  )
}