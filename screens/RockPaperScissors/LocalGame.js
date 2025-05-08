import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

const choices = [
  { id: 1, icon: '✊', name: 'Piedra', color: '#FF6B6B' },
  { id: 2, icon: '✋', name: 'Papel', color: '#4ECDC4' },
  { id: 3, icon: '✌️', name: 'Tijera', color: '#FFD166' },
]

const LocalGame = () => {
  const [players, setPlayers] = useState({
    1: { choice: null, score: 0 },
    2: { choice: null, score: 0 },
  })
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [result, setResult] = useState('')
  const [gameStatus, setGameStatus] = useState('Jugador 1: Elige tu jugada')
  const bounceAnim = useRef(new Animated.Value(0)).current

  const animateChoice = () => {
    bounceAnim.setValue(0)
    Animated.timing(bounceAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.elastic(1.5),
      useNativeDriver: true,
    }).start()
  }

  const handleChoice = (choice) => {
    animateChoice()

    const updatedPlayers = {
      ...players,
      [currentPlayer]: { ...players[currentPlayer], choice },
    }

    setPlayers(updatedPlayers)

    if (currentPlayer === 1) {
      setCurrentPlayer(2)
      setGameStatus('Jugador 2: Elige tu jugada')
    } else {
      determineWinner(updatedPlayers)
    }
  }

  const determineWinner = (players) => {
    const { choice: p1 } = players[1]
    const { choice: p2 } = players[2]
    let newResult = ''

    if (p1 === p2) {
      newResult = '¡Empate!'
    } else if (
      (p1 === '✊' && p2 === '✌️') ||
      (p1 === '✋' && p2 === '✊') ||
      (p1 === '✌️' && p2 === '✋')
    ) {
      newResult = '¡Jugador 1 gana!'
      players[1].score += 1
    } else {
      newResult = '¡Jugador 2 gana!'
      players[2].score += 1
    }

    setResult(newResult)
    setGameStatus(newResult)
  }

  const resetRound = () => {
    setPlayers({
      1: { ...players[1], choice: null },
      2: { ...players[2], choice: null },
    })
    setCurrentPlayer(1)
    setResult('')
    setGameStatus('Jugador 1: Elige tu jugada')
  }

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -15, 0],
  })

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Piedra, Papel o Tijera</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>J1: {players[1].score}</Text>
          <Text style={styles.vs}>VS</Text>
          <Text style={styles.score}>J2: {players[2].score}</Text>
        </View>
      </View>

      {/* Estado del juego */}
      <Text style={styles.status}>{gameStatus}</Text>

      {/* Selección de jugadores */}
      <View style={styles.choicesContainer}>
        {choices.map((item) => (
          <Animated.View
            key={item.id}
            style={[styles.choiceWrapper, { transform: [{ translateY }] }]}
          >
            <TouchableOpacity
              style={[styles.choiceButton, { backgroundColor: item.color }]}
              onPress={() => handleChoice(item.icon)}
              disabled={!!result}
            >
              <Text style={styles.choiceIcon}>{item.icon}</Text>
              <Text style={styles.choiceName}>{item.name}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Resultados */}
      <View style={styles.resultsContainer}>
        {players[1].choice && (
          <View style={styles.playerChoice}>
            <Text style={styles.playerLabel}>Jugador 1</Text>
            <Text style={styles.choiceResult}>{players[1].choice}</Text>
          </View>
        )}

        {players[2].choice && (
          <View style={styles.playerChoice}>
            <Text style={styles.playerLabel}>Jugador 2</Text>
            <Text style={styles.choiceResult}>{players[2].choice}</Text>
          </View>
        )}
      </View>

      {/* Botón de reinicio */}
      {result && (
        <TouchableOpacity style={styles.resetButton} onPress={resetRound}>
          <MaterialIcons name='replay' size={24} color='white' />
          <Text style={styles.resetText}>Nueva ronda</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 15,
  },
  vs: {
    fontSize: 16,
    color: '#aaa',
  },
  status: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  choicesContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  choiceWrapper: {
    alignItems: 'center',
  },
  choiceButton: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.125,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  choiceIcon: {
    fontSize: 50,
    marginBottom: 5,
  },
  choiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  playerChoice: {
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 10,
  },
  choiceResult: {
    fontSize: 60,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#6d28d9',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '60%',
  },
  resetText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
})

export default LocalGame
