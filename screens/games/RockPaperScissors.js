import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  Modal,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')

const choices = [
  { id: 1, icon: '✊', name: 'Piedra', color: 'rgba(255, 255, 255, 0.05)' },
  { id: 2, icon: '✋', name: 'Papel', color: 'rgba(255, 255, 255, 0.05)' },
  { id: 3, icon: '✌️', name: 'Tijera', color: 'rgba(255, 255, 255, 0.05)' },
]

const RockPaperScissors = () => {
  const [players, setPlayers] = useState({
    1: { choice: null, score: 0, name: 'Jugador 1' },
    2: { choice: null, score: 0, name: 'Jugador 2' },
  })
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [showResult, setShowResult] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Animación de fade in
  const animateFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }

  const handleChoice = (choice) => {
    const updatedPlayers = {
      ...players,
      [currentPlayer]: { ...players[currentPlayer], choice },
    }

    setPlayers(updatedPlayers)

    if (currentPlayer === 1) {
      // Oculta la pantalla y pasa al jugador 2
      Alert.alert(
        'Turno completado',
        'Pasa el dispositivo al Jugador 2',
        [{ text: 'OK', onPress: () => setCurrentPlayer(2) }],
        { cancelable: false }
      )
    } else {
      // Ambos han elegido, mostrar resultados
      determineWinner(updatedPlayers)
      animateFadeIn()
      setShowResult(true)
    }
  }

  const determineWinner = (players) => {
    const p1 = players[1].choice
    const p2 = players[2].choice
    let resultText = ''
    let winner = null

    if (p1 === p2) {
      resultText = '¡Empate!'
    } else if (
      (p1 === '✊' && p2 === '✌️') ||
      (p1 === '✋' && p2 === '✊') ||
      (p1 === '✌️' && p2 === '✋')
    ) {
      resultText = `¡${players[1].name} gana!`
      winner = 1
    } else {
      resultText = `¡${players[2].name} gana!`
      winner = 2
    }

    setPlayers((prevPlayers) => ({
      1: {
        ...prevPlayers[1],
        score: winner === 1 ? prevPlayers[1].score + 1 : prevPlayers[1].score,
      },
      2: {
        ...prevPlayers[2],
        score: winner === 2 ? prevPlayers[2].score + 1 : prevPlayers[2].score,
      },
    }))

    setModalVisible(true)
  }

  const resetRound = () => {
    setPlayers({
      1: { ...players[1], choice: null },
      2: { ...players[2], choice: null },
    })
    setCurrentPlayer(1)
    setShowResult(false)
    fadeAnim.setValue(0)
    setModalVisible(false)
  }

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Piedra, Papel o Tijera</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>
            {players[1].score} - {players[2].score}
          </Text>
        </View>
      </View>
      {/* Turno actual */}
      <Text style={styles.turnText}>
        {showResult ? 'Resultado' : `Turno: ${players[currentPlayer].name}`}
      </Text>
      {/* Área de juego */}
      {!showResult ? (
        <View style={styles.gameArea}>
          <Text style={styles.instruction}>
            {currentPlayer === 1
              ? 'Jugador 1: Elige en secreto'
              : 'Jugador 2: Elige en secreto'}
          </Text>

          <View style={styles.choicesContainer}>
            {choices.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.choiceButton, { backgroundColor: item.color }]}
                onPress={() => handleChoice(item.icon)}
              >
                <Text style={styles.choiceIcon}>{item.icon}</Text>
                <Text style={styles.choiceName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <Animated.View style={[styles.resultsArea, { opacity: fadeAnim }]}>
          <View style={styles.resultCard}>
            <Text style={styles.playerName}>{players[1].name}</Text>
            <Text style={styles.choiceResult}>{players[1].choice}</Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.resultCard}>
            <Text style={styles.playerName}>{players[2].name}</Text>
            <Text style={styles.choiceResult}>{players[2].choice}</Text>
          </View>
        </Animated.View>
      )}
      {/* Modal de resultado */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡Resultado Final!</Text>

            {/* Jugador 1 */}
            <View style={styles.modalPlayer}>
              <Text style={styles.modalPlayerName}>{players[1].name}</Text>
              <Text style={styles.modalPlayerChoice}>{players[1].choice}</Text>
            </View>

            {/* VS */}
            <Text style={styles.modalVS}>VS</Text>

            {/* Jugador 2 */}
            <View style={styles.modalPlayer}>
              <Text style={styles.modalPlayerName}>{players[2].name}</Text>
              <Text style={styles.modalPlayerChoice}>{players[2].choice}</Text>
            </View>

            {/* Resultado */}
            <View style={styles.modalResultContainer}>
              <Text style={styles.modalResultText}>
                {players[1].choice === players[2].choice
                  ? '¡Empate!'
                  : (players[1].choice === '✊' &&
                      players[2].choice === '✌️') ||
                    (players[1].choice === '✋' &&
                      players[2].choice === '✊') ||
                    (players[1].choice === '✌️' && players[2].choice === '✋')
                  ? `¡${players[1].name} gana!`
                  : `¡${players[2].name} gana!`}
              </Text>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={resetRound}>
              <MaterialIcons name='replay' size={24} color='white' />
              <Text style={styles.modalButtonText}>Jugar otra vez</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreContainer: {
    marginTop: 10,
  },
  score: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  turnText: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
  },
  choicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  choiceButton: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.135,
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
  },
  choiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  resultsArea: {
    flex: 1,
    justifyContent: 'center',
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  playerName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  choiceResult: {
    fontSize: 60,
  },
  vsText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#24243e',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#6d28d9',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#24243e',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalPlayer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  modalPlayerName: {
    fontSize: 18,
    color: '#aaa',
    fontWeight: '600',
  },
  modalPlayerChoice: {
    fontSize: 60,
    marginTop: 5,
  },
  modalVS: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  modalResultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  modalResultText: {
    fontSize: 22,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: '#6d28d9',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
})

export default RockPaperScissors
