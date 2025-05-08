import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: '1', user: 'Player1', text: '¡Hola a todos!', time: '10:30' },
    { id: '2', user: 'Player2', text: '¿Alguien para jugar?', time: '10:32' },
  ])
  const [message, setMessage] = useState('')
  const flatListRef = useRef()

  const sendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      user: 'Tú',
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages([...messages, newMessage])
    setMessage('')
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Chat Global</Text>
        </View>

        {/* Lista de mensajes */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.user === 'Tú' ? styles.yourMessage : styles.otherMessage,
              ]}
            >
              <Text style={styles.user}>{item.user}</Text>
              <Text style={styles.text}>{item.text}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          )}
          contentContainerStyle={styles.messagesList}
        />

        <View style={[styles.inputWrapper]}>
          <TextInput
            style={styles.input}
            placeholder='Escribe un mensaje...'
            placeholderTextColor='#999'
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message && styles.disabledButton]}
            onPress={sendMessage}
            disabled={!message}
          >
            <MaterialIcons
              name='send'
              size={24}
              color={message ? 'white' : '#999'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#16213e',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 100 : 150, // Ajuste confirmado
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  yourMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6d28d9',
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    borderBottomLeftRadius: 0,
  },
  user: {
    color: '#ddd',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    color: 'white',
  },
  time: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#6d28d9',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
})
