// App.js
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Menu from './screens/Menu'
import Chat from './screens/Chat'
import 'react-native-reanimated'
import GameModeScreen from './screens/GameModeScreen'
import LocalGame from './screens/RockPaperScissors/LocalGame'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Menu'
          component={Menu}
          options={{ headerShown: false }}
        />
        <Stack.Screen name='Chat' component={Chat} />
        <Stack.Screen name='GameMode' component={GameModeScreen} />
        <Stack.Screen name='LocalGame' component={LocalGame} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
