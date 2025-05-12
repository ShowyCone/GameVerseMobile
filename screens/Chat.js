import React, { useState, useRef, useEffect } from 'react'
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
  ActivityIndicator,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { io } from 'socket.io-client'
import { useUser } from '../context/UserContext'

const socket = io(`${process.env.EXPO_PUBLIC_SOCKET_URL}/chat`, {
  transports: ['websocket'],
  autoConnect: false,
})

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const flatListRef = useRef()
  const { username } = useUser()

  useEffect(() => {
    socket.connect()

    const onConnect = () => {
      setIsConnected(true)
      socket.emit('init-connection', {
        username: username,
        room: 'global',
      })
    }

    const updateUsername = () => {
      if (isConnected && username) {
        socket.emit('set-username', username)
      }
    }
    updateUsername()

    const onDisconnect = () => setIsConnected(false)

    const handleNewMessage = (msg) => {
      setMessages((prev) => [
        {
          id: msg.id,
          text: msg.text,
          username: msg.username,
          timestamp: new Date(msg.timestamp),
          isOwn: msg.isOwn,
          type: 'message',
        },
        ...prev,
      ])
    }

    const handleSystemMessage = (msg) => {
      setMessages((prev) => [
        {
          id: Date.now().toString(),
          text: msg.text,
          type: 'system',
          timestamp: new Date(),
        },
        ...prev,
      ])
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('new-message', handleNewMessage)
    socket.on('system-message', handleSystemMessage)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('new-message', handleNewMessage)
      socket.off('system-message', handleSystemMessage)
      socket.disconnect()
    }
  }, [username])

  const sendMessage = () => {
    if (!inputText.trim()) return

    socket.emit('send-message', {
      text: inputText,
      username: username,
    })

    setInputText('')
  }

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isOwn && styles.ownMessage,
        item.type === 'system' && styles.systemMessage,
      ]}
    >
      {item.type === 'message' && (
        <Text style={[styles.username, item.isOwn && styles.ownUsername]}>
          {item.username}
        </Text>
      )}
      <View
        style={[styles.messageBubble, item.isOwn && styles.ownMessageBubble]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={[styles.timestamp, item.isOwn && styles.ownTimestamp]}>
          {item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GameVerse Chat</Text>
        <View style={styles.connectionStatus}>
          <View
            style={[styles.statusIndicator, isConnected && styles.connected]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Online' : 'Connecting...'}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Type a message...'
          placeholderTextColor='#888'
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={isConnected}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <MaterialIcons
            name='send'
            size={24}
            color={inputText.trim() ? '#fff' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '600',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  connected: {
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  systemMessage: {
    alignSelf: 'center',
  },
  username: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  ownUsername: {
    textAlign: 'right',
  },
  messageText: {
    color: '#E2E8F0',
    fontSize: 16,
  },
  timestamp: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  ownMessageBubble: {
    backgroundColor: '#3B82F6',
  },
  ownTimestamp: {
    color: '#E2E8F0',
  },
})

export default Chat
