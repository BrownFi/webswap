import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'

import { Menu, X } from 'react-feather'
import { useLocation } from 'react-router-dom'

import { useWindowSize } from 'hooks/useWindowSize'

const HamburgerMenu: React.FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const windowSize = useWindowSize()
  const { pathname } = useLocation()

  const toggleMenu = () => setIsOpen(!isOpen)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (Number(windowSize.width) >= 960) {
    return <>{children}</>
  }

  return (
    <>
      {/* Hamburger Button fixed to top-right, visible only below 960px */}
      <button onClick={toggleMenu} className="fixed top-4 right-4 p-2 text-white hover:text-indigo-200 bg-transparent">
        <Menu className="w-6 h-6" />
      </button>

      {/* Menu Overlay */}
      <div
        ref={menuRef}
        className={`
          fixed top-0 left-0 right-0 p-6 shadow-xl overflow-auto
          transform transition-all duration-300 ease-in-out
          bg-[#e0e8ff0d] backdrop-blur-sm
          ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
        {/* Close Button */}
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 p-2 text-white hover:text-indigo-200 bg-transparent"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Menu Items */}
        <div className="mt-8">{children}</div>
      </div>
    </>
  )
}

export default HamburgerMenu
