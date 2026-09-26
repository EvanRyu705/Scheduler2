import { useState } from 'react'
import { Link, Route, Routes } from 'react-router'
import HomePage from './pages/home'
import FriendsPage from './pages/friends'
import GroupsPage from './pages/groups'

const ROUTES = [
  { path: "/", element: <HomePage /> },
  { path: "/friends", element: <FriendsPage /> },
  { path: "/groups", element: <GroupsPage /> },
]

export default function Layout() {


  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      {/* Header */}
      <nav className="p-5 space-x-3 flex top bg-base-300">
        <button class="btn btn-square btn-ghost">
          +
        </button>
        <div></div>
        <Link to="/">
          <button className="btn btn-ghost">Home</button>
        </Link>
        <Link to="/friends">
          <button className="btn btn-ghost">Friends</button>
        </Link>
        <Link to="/groups">
          <button className="btn btn-ghost">Groups</button>
        </Link>
        <div></div>
      </nav>
      {/* Main */}
      <Routes>
        {ROUTES.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
      </Routes>
      {/* Footer */}
      <div className="p-5 bg-base-300">Footer</div>
    </div>
  )
}
