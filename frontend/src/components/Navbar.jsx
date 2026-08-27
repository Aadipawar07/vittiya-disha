// Fixed top navigation with logo and route links
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const currentPage = location.pathname === '/' ? 'home' : location.pathname.substring(1)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-beige/90 backdrop-blur-md border-b-2 border-ink/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'conic-gradient(from 0deg,#E8762C,#C6961D,#E8762C)'
            }}
          >
            <span className="font-display text-xs font-bold text-beige">VD</span>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Vittiya <em className="not-italic text-saffron">Disha</em>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-inkSoft">
          <Link
            to="/"
            className={`nav-link ${currentPage === 'home' ? 'current' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/assess"
            className={`nav-link ${currentPage === 'assess' ? 'current' : ''}`}
          >
            Start Assessment
          </Link>
          <Link
            to="/report"
            className={`nav-link ${currentPage === 'report' ? 'current' : ''}`}
          >
            Feasibility Report
          </Link>
          <Link
            to="/financial"
            className={`nav-link ${currentPage === 'financial' ? 'current' : ''}`}
          >
            Financial Structure
          </Link>
          <Link
            to="/stress-test"
            className={`nav-link ${currentPage === 'stress-test' ? 'current' : ''}`}
          >
            Stress Test
          </Link>
          <Link
            to="/officer"
            className={`nav-link ${currentPage === 'officer' ? 'current' : ''}`}
          >
            Officer View
          </Link>
        </nav>

        {/* CTA Button */}
        <Link
          to="/assess"
          className="btn-primary text-beige text-sm font-bold px-6 py-3 rounded-full"
        >
          Start Journey →
        </Link>
      </div>
    </header>
  )
}
