import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Menu from './screens/Menu'
import Chat from './screens/Chat'
import 'react-native-reanimated'
import GameModeScreen from './screens/GameModeScreen'
import RockPaperScissors from './screens/games/RockPaperScissors'
import TicTacToe from './screens/games/TicTacToe'
import ConnectFour from './screens/games/ConnectFour'
import { GameProvider } from './context/GameContext'
import { UserProvider } from './context/UserContext'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <UserProvider>
      <GameProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name='Menu'
              component={Menu}
              options={{ headerShown: false }}
            />
            <Stack.Screen name='Chat' component={Chat} />
            <Stack.Screen name='GameMode' component={GameModeScreen} />
            <Stack.Screen
              name='RockPaperScissors'
              component={RockPaperScissors}
            />
            <Stack.Screen name='TicTacToe' component={TicTacToe} />
            <Stack.Screen name='ConnectFour' component={ConnectFour} />
          </Stack.Navigator>
        </NavigationContainer>
      </GameProvider>
    </UserProvider>
  )
}
