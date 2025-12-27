import { useState, useEffect } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'

// YOUR SUPABASE CREDENTIALS (CONFIGURED!)
const SUPABASE_URL = 'https://ktnvjsslyksrdyewosqs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnZqc3NseWtzcmR5ZXdvc3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwMzY2OTgsImV4cCI6MjA1MDYxMjY5OH0.sb_publishable_2Aoxu2nyXCR8U_VKamqvew_nEkliQna'

function App() {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [centreName, setCentreName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('iqa_session')
    if (session) setUser(JSON.parse(session))
  }, [])

  const signUp = async () => {
    if (!email || !password || !centreName) {
      setMessage('Please fill all fields')
      return
    }
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          data: { centre_name: centreName }
        })
      })

      const data = await response.json()

      if (data.error) {
        setMessage(data.error.message)
      } else {
        setMessage('✅ Success! Check your email to verify. Then come back and sign in!')
        setEmail('')
        setPassword('')
        setCentreName('')
        setTimeout(() => setAuthMode('signin'), 4000)
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    }
    setLoading(false)
  }

  const signIn = async () => {
    if (!email || !password) {
      setMessage('Please fill all fields')
      return
    }
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.error) {
        setMessage(data.error.message)
      } else {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          centre_name: data.user.user_metadata?.centre_name || 'My Centre',
          token: data.access_token
        }

        localStorage.setItem('iqa_session', JSON.stringify(userData))
        setUser(userData)
        setMessage('')
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    }
    setLoading(false)
  }

  const signOut = () => {
    localStorage.removeItem('iqa_session')
    setUser(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-600 p-4 rounded-xl mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">IQA Assistant Pro</h1>
            <p className="text-slate-400">AI-Powered Quality Assurance</p>
            <div className="mt-3 inline-block bg-green-500 bg-opacity-20 border border-green-500 rounded-full px-4 py-1">
              <span className="text-green-300 text-sm font-semibold">✓ Connected to Database</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                authMode === 'signin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                authMode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {authMode === 'signup' && (
              <input
                type="text"
                placeholder="Centre Name (e.g., ABC Training College)"
                value={centreName}
                onChange={(e) => setCentreName(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />

            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />

            <button
              onClick={authMode === 'signin' ? signIn : signUp}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('Error') || message.includes('error')
                  ? 'bg-red-500 bg-opacity-20 border border-red-500 text-red-300'
                  : 'bg-green-500 bg-opacity-20 border border-green-500 text-green-300'
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-600">
            <p className="text-xs text-slate-400 text-center">
              🔒 Your data is secure with Supabase authentication
            </p>
          </div>
        </div>
        <SpeedInsights />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="bg-slate-800 bg-opacity-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IQA Assistant Pro</h1>
              <p className="text-slate-400 text-sm">{user.centre_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{user.email}</span>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
              <div className="text-4xl font-bold text-blue-400 mb-2">0</div>
              <p className="text-slate-400">Samples Created</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
              <div className="text-4xl font-bold text-green-400 mb-2">0</div>
              <p className="text-slate-400">Reports Generated</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
              <div className="text-4xl font-bold text-purple-400 mb-2">0</div>
              <p className="text-slate-400">Files Uploaded</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
              <div className="text-4xl font-bold text-amber-400 mb-2">0h</div>
              <p className="text-slate-400">Time Saved</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600">
              <h2 className="text-2xl font-bold text-white mb-6">🎯 Coming Soon</h2>
              <p className="text-slate-300 mb-4">
                You're in the beta! We're building the world's first AI-powered IQA sampling assistant specifically for UK training centres. Here's what's coming:
              </p>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>AI Sampling Engine</strong> - Automatically select representative samples using advanced algorithms</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>Recording & Analysis</strong> - Built-in recording and AI analysis of learner interactions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>Compliance Reports</strong> - Auto-generate reports for Ofsted and QAA standards</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>Real-time Collaboration</strong> - Work with colleagues in real-time</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
              <h3 className="text-lg font-bold text-white mb-4">👋 Beta Tester?</h3>
              <p className="text-sm text-slate-400 mb-4">
                As a beta tester, your feedback is invaluable! What features would help you most?
              </p>
              <textarea
                placeholder="Tell us: What takes the most time in your IQA work? What would you want this tool to do first?"
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 min-h-32 mb-4"
              />
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold">
                Submit Feedback
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600 mt-6">
            <h3 className="text-lg font-bold text-white mb-4">🚀 What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <p className="text-white font-semibold">Full Features Going Live</p>
                  <p className="text-slate-400">AI sampling, recording, compliance - all coming this week!</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <p className="text-white font-semibold">Test & Give Feedback</p>
                  <p className="text-slate-400">Your input shapes the final product</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <p className="text-white font-semibold">Lifetime Beta Discount</p>
                  <p className="text-slate-400">FREE forever as a thank you for testing!</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <p className="text-white font-semibold">Refer & Earn</p>
                  <p className="text-slate-400">Get rewards for referring colleagues!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <SpeedInsights />
    </div>
  )
}

export default App
