// s@/components/Navbar.jsx
import React, { useEffect, useState, useRef, useContext } from 'react'
import { FaUser } from 'react-icons/fa'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '@/contexts/AuthContext'
import { logout } from '@/services/authService'
import { toast } from 'react-toastify'
import NotificationBell from '@/components/notifications/NotificationBell' // 👈 THÊM

const navLinkClass = ({ isActive }) =>
  `relative text-[15px] tracking-[-0.02em] transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:rounded-full after:bg-orange-500 after:transition-all after:duration-300 ${
    isActive
      ? 'text-orange-600 after:w-full'
      : 'text-slate-700 hover:text-orange-600 after:w-0 hover:after:w-full'
  }`

export default function Navbar() {
  const { user } = useContext(AuthContext)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef()
  const navigate = useNavigate()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const profileRef = useRef()

  // Đóng PROFILE khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClickLogout = async () => {
    try {
      await logout()
      toast.success('Logout Successful!')
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="brand-shell mx-auto flex w-full max-w-7xl items-center justify-between rounded-[26px] px-5 py-4 md:px-6">
      {/* LOGO */}
      <Link
        to="/"
        className="font-display text-[1.85rem] font-bold tracking-[-0.08em] text-slate-900 md:text-[2.15rem]"
      >
        <span className="bg-gradient-to-r from-orange-500 via-amber-600 to-orange-800 bg-clip-text text-transparent">
          FitLink
        </span>
        <span className="text-slate-900">.</span>
      </Link>

      {/* NAVIGATION */}
      <nav className="hidden md:flex items-center gap-8 font-medium">
        <NavLink
          to="/home"
          className={navLinkClass}
        >
          Home
        </NavLink>
        <NavLink
          to="/programs"
          className={navLinkClass}
        >
          Programs
        </NavLink>
        <NavLink
          to="/list-pt"
          className={navLinkClass}
        >
          Trainers
        </NavLink>
        <NavLink
          to="/pricing"
          className={navLinkClass}
        >
          Pricing
        </NavLink>
        <NavLink
          to="/about"
          className={navLinkClass}
        >
          About
        </NavLink>
        <NavLink
          to="/contact"
          className={navLinkClass}
        >
          Contact
        </NavLink>
      </nav>

      {/* USER / LOGIN */}
      {user ? (
        <div className="relative flex items-center gap-3" ref={profileRef}>
          {/* 🔔 Chuông thông báo – controlled từ Navbar */}
          <NotificationBell
            isOpen={isNotifOpen}
            onOpen={() => {
              setIsNotifOpen(true)
              setIsProfileOpen(false) // 🔒 mở chuông thì đóng profile
            }}
            onClose={() => setIsNotifOpen(false)}
            variant="light"
          />

          {/* 👤 Avatar / toggle menu Profile */}
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((prev) => !prev) // toggle profile
              setIsNotifOpen(false) // 🔒 mở profile thì đóng chuông
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/80 bg-white/80 shadow-sm hover:-translate-y-0.5 hover:border-orange-300"
          >
            <FaUser className="cursor-pointer text-slate-700 hover:text-orange-500 transition" />
          </button>

          {/* Dropdown Profile */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full z-[9999] mt-3 w-60 overflow-hidden rounded-2xl border border-white/70 bg-[rgba(255,252,248,0.95)] shadow-[0_24px_60px_rgba(88,54,24,0.16)] backdrop-blur-xl text-slate-700">
              <ul className="py-1">
                <li
                  className="cursor-pointer px-4 py-2.5 hover:bg-orange-50"
                  onClick={() => {
                    navigate('/profile')
                    setIsProfileOpen(false)
                  }}
                >
                  Profile
                </li>
                <li
                  className="cursor-pointer px-4 py-2.5 hover:bg-orange-50"
                  onClick={() => {
                    navigate('/my-packages')
                    setIsProfileOpen(false)
                  }}
                >
                  My Packages
                </li>

                <li
                  className="flex cursor-pointer items-center gap-2 px-4 py-2.5 hover:bg-orange-50"
                  onClick={() => {
                    navigate('/training-calendar')
                    setShowDropdown(false)
                  }}
                >
                  My Training Schedule
                </li>
                <li
                  className="cursor-pointer px-4 py-2.5 hover:bg-orange-50"
                  onClick={() => {
                    navigate(user?.role === 'pt' ? '/pt/chat' : '/chat')
                    setIsProfileOpen(false)
                  }}
                >
                  My Messages
                </li>
                <li className="cursor-pointer px-4 py-2.5 hover:bg-orange-50">
                  Support
                </li>
                <li
                  className="cursor-pointer px-4 py-2.5 font-medium text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setIsProfileOpen(false)
                    setIsNotifOpen(false)
                    handleClickLogout()
                  }}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="ml-4 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-5 py-2.5 font-semibold text-white shadow-[0_14px_30px_rgba(245,158,11,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(245,158,11,0.34)]"
        >
          Join Now
        </button>
      )}
    </header>
  )
}
