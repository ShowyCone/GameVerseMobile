import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { useGame } from '../context/GameContext'
import { useUser } from '../context/UserContext'

const { width } = Dimensions.get('window')

export default function Menu() {
  const { setSelectedGame } = useGame()
  const navigation = useNavigation()
  const { setUsername } = useUser()
  const [inputName, setInputName] = useState('')

  const handleSubmit = () => {
    const finalUsername =
      inputName.trim() || `Jugador${Math.floor(Math.random() * 9000 + 1000)}`
    setUsername(finalUsername)
    navigation.navigate('Chat')
  }

  const games = [
    {
      id: 'RockPaperScissors',
      name: 'Piedra Papel o Tijeras',
      component: 'GameMode',
    },
    { id: 'TicTacToe', name: 'Tic-Tac-Toe', component: 'GameMode' },
    { id: 'ConnectFour', name: '4 en raya', component: 'GameMode' },
  ]

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor='#1a1a2e' barStyle='light-content' />

      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>GAMERVERSE</Text>
          <Text style={styles.subtitle}>Juegos Online Multijugador</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder='Nombre de jugador'
          placeholderTextColor='#a1a1aa'
          cursorColor='#6d28d9'
          value={inputName}
          onChangeText={setInputName}
        />

        <View style={styles.buttonsContainer}>
          {games.map((game) => (
            <GameButton
              key={game.id}
              icon='sports-esports'
              title={game.name}
              onPress={() => {
                setSelectedGame(game.id)
                navigation.navigate('GameMode')
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => {
            handleSubmit()
            navigation.navigate('Chat')
          }}
        >
          <MaterialIcons name='chat' size={24} color='white' />
          <Text style={styles.chatButtonText}>Chat Global</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )
}

function GameButton({ icon, title, onPress }) {
  return (
    <TouchableOpacity
      style={styles.gameButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={24} color='#6d28d9' />
      </View>
      <Text style={styles.buttonText}>{title}</Text>
      <MaterialIcons name='arrow-forward-ios' size={18} color='#a1a1aa' />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  gradient: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: 16,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonsContainer: {
    gap: 15,
  },
  gameButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6d28d9',
  },
  iconContainer: {
    backgroundColor: 'rgba(109, 40, 217, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginRight: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chatButton: {
    backgroundColor: '#6d28d9',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
})
