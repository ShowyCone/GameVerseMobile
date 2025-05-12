// context/UserContext.js
import React, { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState(() => {
    return `Jugador${Math.floor(Math.random() * 9000 + 1000)}`
  })

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider')
  }
  return context
}
