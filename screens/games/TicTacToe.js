import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    for (let line of lines) {
      const [a, b, c] = line
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a]
      }
    }
    return null
  }

  const handlePress = (index) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)

    const gameWinner = calculateWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start()
      setTimeout(() => setModalVisible(true), 1000)
    } else if (!newBoard.includes(null)) {
      setWinner('draw')
      setModalVisible(true)
    } else {
      setIsXNext(!isXNext)
    }
  }

  const resetGame = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setBoard(Array(9).fill(null))
      setIsXNext(true)
      setWinner(null)
      setModalVisible(false)
      fadeAnim.setValue(1)
    })
  }

  const renderSquare = (index) => {
    const isWinningSquare =
      winner &&
      (winner === 'X' || winner === 'O') &&
      calculateWinner(board) === board[index]

    return (
      <TouchableOpacity
        style={[
          styles.square,
          isWinningSquare && styles.winningSquare,
          index % 3 !== 2 && styles.rightBorder,
          index < 6 && styles.bottomBorder,
        ]}
        onPress={() => handlePress(index)}
      >
        <Text
          style={[
            styles.squareText,
            board[index] === 'X' && styles.xColor,
            board[index] === 'O' && styles.oColor,
          ]}
        >
          {board[index]}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {winner ? 'Juego terminado' : `Turno: ${isXNext ? 'X' : 'O'}`}
          </Text>
        </View>
      </View>

      <Animated.View style={[styles.board, { opacity: winner ? fadeAnim : 1 }]}>
        <View style={styles.row}>
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </View>
        <View style={styles.row}>
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </View>
        <View style={styles.row}>
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </View>
      </Animated.View>

      <Modal
        animationType='fade'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {winner === 'draw' ? '¡Empate!' : `¡${winner} gana!`}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={resetGame}>
              <MaterialIcons name='replay' size={24} color='white' />
              <Text style={styles.modalButtonText}>Jugar de nuevo</Text>
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
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#e94560',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  statusContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  board: {
    width: width - 60,
    height: width - 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  square: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  xColor: {
    color: '#e94560',
    textShadowColor: 'rgba(233, 69, 96, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  oColor: {
    color: '#00b4d8',
    textShadowColor: 'rgba(0, 180, 216, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  rightBorder: {
    borderRightWidth: 2,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  winningSquare: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: '#e94560',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
})

export default TicTacToe
