import React, { createContext, useState, useContext } from 'react'

const GameContext = createContext()

export const GameProvider = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState(null)

  return (
    <GameContext.Provider
      value={{
        selectedGame,
        setSelectedGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  return useContext(GameContext)
}
