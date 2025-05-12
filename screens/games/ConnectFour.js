import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  TextInput,
  FlatList,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { useGame } from '../../context/GameContext'
import { useUser } from '../../context/UserContext'
import { io } from 'socket.io-client'

const { width } = Dimensions.get('window')
const COLUMNS = 7
const ROWS = 6
const ConnectFour = ({ route }) => {
  const isOnline = route.params?.isOnline ?? false
  console.log('isOnline', isOnline)

  const [myColor, setMyColor] = useState(null)
  const [availableRooms, setAvailableRooms] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [showRoomActions, setShowRoomActions] = useState(false)
  const { username } = useUser()
  const [socket, setSocket] = useState(null)
  const [roomId, setRoomId] = useState('')
  const [opponent, setOpponent] = useState(null)
  const [gameStatus, setGameStatus] = useState('waiting')
  const [room, setRoom] = useState(null)
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

    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        if (isOnline) {
          handleOnlineMove(row, col)
        } else {
          const newBoard = [...board]
          newBoard[row][col] = currentPlayer
          setBoard(newBoard)
          if (!isOnline) {
            const newBoard = board.map((row) => [...row]) // copia profunda
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
            } else if (newBoard.every((row) => row.every((cell) => cell))) {
              setWinner('draw')
              setModalVisible(true)
            } else {
              setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
            }
          }
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

  // Online
  useEffect(() => {
    if (isOnline) {
      const gameSocket = io(`${process.env.EXPO_PUBLIC_SOCKET_URL}/games`)
      setSocket(gameSocket)

      // Escuchar actualizaciones de salas
      gameSocket.on('rooms-updated', fetchRooms)

      // Limpieza
      return () => {
        gameSocket.off('rooms-updated')
        gameSocket.disconnect()
      }
    }
  }, [isOnline])

  const createOnlineGame = () => {
    socket.emit('create-connect4', { username }, (roomId) => {
      setRoom({ id: roomId, status: 'waiting' })
      setGameStatus('waiting_opponent')
    })
  }

  const handleJoinGame = async () => {
    if (!roomId) {
      setJoinError('Ingresa un código de sala')
      return
    }

    socket.emit('validate-room', { roomId }, (response) => {
      if (!response.exists) {
        setJoinError('Sala no encontrada')
      } else if (response.isFull) {
        setJoinError('Sala llena')
      } else {
        setJoinError('')
        socket.emit('join-connect4', { roomId, username }, () => {
          setGameStatus('playing')
        })
      }
    })
  }

  useEffect(() => {
    if (!socket || !isOnline) return

    // 1) Cuando la partida arranca:
    socket.on('game-started', ({ roomId, players, currentPlayer, board }) => {
      console.log('🔴🔵 Game started:', { roomId, players, currentPlayer })
      setRoom({ id: roomId, players, currentPlayer, status: 'playing' })
      setBoard(board)
      setGameStatus('playing')

      // Identificar mi color
      const me = players.find((p) => p.id === socket.id)
      setMyColor(me?.color || 'red')
    })

    // 2) Cada vez que alguien hace un movimiento:
    socket.on('move-made', ({ row, column, color, nextPlayer }) => {
      console.log('🎯 Move made:', { row, column, color, nextPlayer })
      setBoard((prev) => {
        const copy = prev.map((r) => [...r])
        copy[row][column] = color
        return copy
      })
      // Actualizar índice de currentPlayer en room
      setRoom((prev) => ({
        ...prev,
        currentPlayer: prev.players.findIndex((p) => p.id === nextPlayer),
      }))
    })

    // 3) Fin del juego:
    socket.on('game-over', ({ winner: winnerName, board: finalBoard }) => {
      console.log('🏁 Game over:', winnerName)
      setBoard(finalBoard)
      setWinner(winnerName)
      setModalVisible(true)
    })

    // 4) Errores al unirse
    socket.on('join-error', ({ message }) => {
      console.warn('🚫 Join error:', message)
      setJoinError(message)
      fetchRooms()
    })

    // 5) Limpieza
    return () => {
      socket.off('game-started')
      socket.off('move-made')
      socket.off('game-over')
      socket.off('join-error')
    }
  }, [socket, isOnline])

  const joinOnlineGame = (roomId) => {
    socket.emit('join-connect4', { roomId, username })
  }

  const handleOnlineMove = (col) => {
    if (!room?.players || room.currentPlayer == null) return
    const isMyTurn = socket.id === room.players[room.currentPlayer]?.id
    if (isMyTurn) {
      socket.emit('connect4-move', { roomId: room.id, column: col })
    } else {
      console.log('No es tu turno')
    }
  }

  const fetchRooms = () => {
    setRefreshing(true)
    socket.emit('list-rooms', (rooms) => {
      if (rooms && Array.isArray(rooms)) {
        setAvailableRooms(rooms)
      } else {
        console.error('Respuesta inválida:', rooms)
      }
      setRefreshing(false)
    })
  }

  // Crear sala (flujo directo al juego)
  const createRoom = () => {
    socket.emit('create-connect4', { username }, (roomId) => {
      console.log(roomId)
      setRoom({ id: roomId, status: 'waiting' })
      setGameStatus('playing') // Va directo al tablero
      fetchRooms() // Actualiza lista
    })
  }

  // Unirse a sala (flujo directo)
  const joinRoom = (roomId) => {
    socket.emit('join-connect4', { roomId, username }, (success) => {
      if (success) {
        setRoom({ id: roomId, status: 'playing' })
        setGameStatus('playing')
      } else {
        Alert.alert('Error', 'No se pudo unir a la sala')
        fetchRooms()
      }
    })
  }

  // Pantalla de selección
  if (isOnline && !room) {
    return (
      <View style={styles.roomSelectionContainer}>
        <Text style={styles.sectionTitle}>Conecta 4 Online</Text>

        <TouchableOpacity style={styles.createButton} onPress={createRoom}>
          <MaterialIcons name='add' size={24} color='white' />
          <Text style={styles.buttonText}>Crear Nueva Sala</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <View style={styles.roomListHeader}>
          <Text style={styles.sectionTitle}>Salas Disponibles</Text>
          <TouchableOpacity onPress={fetchRooms}>
            <MaterialIcons
              name='refresh'
              size={24}
              color={refreshing ? '#ccc' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={availableRooms}
          refreshing={refreshing}
          onRefresh={fetchRooms}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() => joinRoom(item.id)}
            >
              <Text style={styles.roomName}>Sala: {item.id}</Text>
              <Text style={styles.roomCreator}>
                Creada por: {item.players[0].username}
              </Text>
              <MaterialIcons name='chevron-right' size={24} color='#666' />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay salas disponibles</Text>
          }
        />
      </View>
    )
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
        <Text
          style={[
            styles.title,
            myColor === 'red'
              ? { color: '#e94560' }
              : myColor === 'yellow'
              ? { color: '#ffd700' }
              : {},
          ]}
        >
          Conecta 4{' '}
          {isOnline && (
            <Text style={{ fontSize: 16, color: 'white' }}>
              {isOnline ? '(Online)' : '(Local)'}
            </Text>
          )}
        </Text>
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

      {isOnline && room?.id && (
        <View style={styles.roomActionsContainer}>
          <TouchableOpacity
            style={styles.roomActionButton}
            onPress={() => setShowRoomActions(!showRoomActions)}
          >
            <MaterialIcons name='link' size={24} color='white' />
            <Text style={styles.roomActionText}>Sala: {room.id}</Text>
          </TouchableOpacity>

          {showRoomActions && (
            <View style={styles.roomActionsMenu}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Clipboard.setString(room.id)
                  Alert.alert(
                    'ID copiado',
                    '¡Comparte este código con tu amigo!'
                  )
                }}
              >
                <MaterialIcons name='content-copy' size={20} color='white' />
                <Text style={styles.actionButtonText}>Copiar ID</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  Share.share({
                    message: `Únete a mi partida de Conecta 4! ID: ${room.id}`,
                    title: 'Invitar a jugar',
                  })
                }
              >
                <MaterialIcons name='share' size={20} color='white' />
                <Text style={styles.actionButtonText}>Compartir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
  onlineMenu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  onlineTitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 30,
  },
  onlineButton: {
    backgroundColor: '#e94560',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  orText: {
    color: 'white',
    marginVertical: 10,
  },
  roomInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  roomActionsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  roomActionButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  roomActionText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  roomActionsMenu: {
    position: 'absolute',
    bottom: 50,
    right: 0,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roomCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 20,
    letterSpacing: 5,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
  },
  errorText: {
    color: '#FF5252',
    marginBottom: 10,
  },
  roomSelectionContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  roomListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  roomItem: {
    backgroundColor: '#252525',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roomName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomCreator: {
    color: '#aaa',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default ConnectFour
