import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import OnboardingForm from './components/OnboardingForm'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  OnboardIQ
                </h1>
                <span className="ml-2 text-sm text-slate-500 font-medium">
                  Secure & Intelligent Onboarding Hub
                </span>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Onboard
                </Link>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<OnboardingForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
