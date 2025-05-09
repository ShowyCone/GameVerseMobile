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
const COLUMNS = 7
const ROWS = 6

const ConnectFour = () => {
  const [board, setBoard] = useState(
    Array(ROWS)
      .fill()
      .map(() => Array(COLUMNS).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const checkWinner = (row, col) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1], // horizontal, vertical, diagonal down, diagonal up
    ]

    for (let [dx, dy] of directions) {
      let count = 1

      // Check in positive direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * dx
        const newCol = col + i * dy
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLUMNS &&
          board[newRow][newCol] === currentPlayer
        ) {
          count++
        } else {
          break
        }
      }

      // Check in negative direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - i * dx
        const newCol = col - i * dy
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLUMNS &&
          board[newRow][newCol] === currentPlayer
        ) {
          count++
        } else {
          break
        }
      }

      if (count >= 4) return true
    }

    return false
  }

  const handleColumnPress = (col) => {
    if (winner) return

    // Find the first empty row in the column
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        const newBoard = [...board]
        newBoard[row][col] = currentPlayer
        setBoard(newBoard)

        if (checkWinner(row, col)) {
          setWinner(currentPlayer)
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start()
          setTimeout(() => setModalVisible(true), 1000)
        } else if (board.every((row) => row.every((cell) => cell))) {
          setWinner('draw')
          setModalVisible(true)
        } else {
          setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
        }
        break
      }
    }
  }

  const resetGame = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setBoard(
        Array(ROWS)
          .fill()
          .map(() => Array(COLUMNS).fill(null))
      )
      setCurrentPlayer('red')
      setWinner(null)
      setModalVisible(false)
      fadeAnim.setValue(1)
    })
  }

  const renderBoard = () => {
    return (
      <Animated.View style={[styles.board, { opacity: winner ? fadeAnim : 1 }]}>
        <View style={styles.columnsContainer}>
          {Array(COLUMNS)
            .fill()
            .map((_, col) => (
              <TouchableOpacity
                key={col}
                style={styles.column}
                onPress={() => handleColumnPress(col)}
                activeOpacity={0.7}
              >
                <View style={styles.columnInner}>
                  {Array(ROWS)
                    .fill()
                    .map((_, row) => (
                      <View key={row} style={styles.cell}>
                        {board[row][col] && (
                          <View
                            style={[
                              styles.piece,
                              board[row][col] === 'red'
                                ? styles.redPiece
                                : styles.yellowPiece,
                            ]}
                          />
                        )}
                      </View>
                    ))}
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </Animated.View>
    )
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Conecta 4</Text>
        <View style={styles.statusContainer}>
          <View style={styles.playerIndicatorContainer}>
            <Text style={styles.statusText}>Turno actual:</Text>
            <View
              style={[
                styles.playerIndicator,
                currentPlayer === 'red'
                  ? styles.redIndicator
                  : styles.yellowIndicator,
              ]}
            />
          </View>
        </View>
      </View>

      {renderBoard()}

      <Modal
        animationType='fade'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {winner === 'draw'
                ? '¡Empate!'
                : `¡Jugador ${winner === 'red' ? 'Rojo' : 'Amarillo'} gana!`}
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
  playerIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginRight: 10,
  },
  playerIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  redIndicator: {
    backgroundColor: '#e94560',
    borderWidth: 2,
    borderColor: '#ff7a8a',
  },
  yellowIndicator: {
    backgroundColor: '#ffd700',
    borderWidth: 2,
    borderColor: '#ffff78',
  },
  board: {
    backgroundColor: '#1a237e',
    borderRadius: 15,
    padding: 10,
    marginHorizontal: 10,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 3,
  },
  columnInner: {
    flexDirection: 'column-reverse',
  },
  cell: {
    aspectRatio: 1,
    marginVertical: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  piece: {
    width: '90%',
    height: '90%',
    borderRadius: 100,
  },
  redPiece: {
    backgroundColor: '#e94560',
    borderWidth: 2,
    borderColor: '#ff7a8a',
  },
  yellowPiece: {
    backgroundColor: '#ffd700',
    borderWidth: 2,
    borderColor: '#ffff78',
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

export default ConnectFour
