import { Link, Route, Routes, useLocation } from 'react-router'
import HomePage from './pages/home'
import GroupsPage from './pages/groups'

const ROUTES = [
  { path: "/", element: <HomePage /> },
  { path: "/groups", element: <GroupsPage /> },
]

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <nav className="navbar border-b border-base-300 bg-base-100 px-6">
        <div className="text-4xl font-bold">Timely</div>
        <div className="ml-auto flex gap-2">
          <Link className={`btn ${location.pathname === '/' ? 'btn-neutral' : 'btn-ghost'}`} to="/">Home</Link>
          <Link className={`btn ${location.pathname === '/groups' ? 'btn-neutral' : 'btn-ghost'}`} to="/groups">Groups</Link>
        </div>
      </nav>
      <main className="flex-1">
        <Routes>
          {ROUTES.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
        </Routes>
      </main>
    </div>
  )
}
