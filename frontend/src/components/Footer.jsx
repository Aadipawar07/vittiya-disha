// Bottom footer with tagline
export default function Footer() {
  return (
    <footer className="border-t-2 border-ink/10 py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-inkSoft">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="" className="w-10 h-10 object-contain" />
          <p>© Vittiya Disha — Team [Your Team Name], SIH 2026 · PS 26091</p>
        </div>
        <p className="font-mono text-xs font-semibold">AI explains. The engine decides.</p>
      </div>
    </footer>
  )
}
