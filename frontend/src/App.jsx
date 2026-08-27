import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AssessmentProvider } from './context/AssessmentContext'
import { useRevealOnScroll } from './hooks/useRevealOnScroll'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import BusinessInput from './pages/BusinessInput'
import FinancialAssessment from './pages/FinancialAssessment'
import Analysis from './pages/Analysis'
import Schemes from './pages/Schemes'
import Financial from './pages/Financial'
import StressTest from './pages/StressTest'
import Lenders from './pages/Lenders'
import Report from './pages/Report'
import OfficerDashboard from './pages/OfficerDashboard'
import SchemeResults from './pages/SchemeResults'

function AppContent() {
  useRevealOnScroll()

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assess" element={<FinancialAssessment />} />
          <Route path="/start-assessment" element={<FinancialAssessment />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/scheme-results/:schemeCode" element={<SchemeResults />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/stress-test" element={<StressTest />} />
          <Route path="/lenders" element={<Lenders />} />
          <Route path="/report" element={<Report />} />
          <Route path="/officer" element={<OfficerDashboard />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <AssessmentProvider>
      <Router>
        <AppContent />
      </Router>
    </AssessmentProvider>
  )
}

export default App
