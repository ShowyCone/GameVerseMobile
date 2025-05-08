import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const GameModeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elige el modo de juego:</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LocalGame')}
      >
        <Text style={styles.buttonText}>Local (2 jugadores)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OnlineGame')}
      >
        <Text style={styles.buttonText}>Online (Multijugador)</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6d28d9',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default GameModeScreen
