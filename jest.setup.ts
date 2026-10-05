// Mocks globaux pour les tests Jest (jest-expo).
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () =>
  jest.requireActual('react-native-safe-area-context/jest/mock').default
);

// Icônes : composant hôte simple (évite le chargement asynchrone des polices).
// Le nom de l'icône reste accessible via la prop `name`.
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));

// Expo Router : navigation espionnée, paramètres d'URL pilotés par les tests.
// useFocusEffect est exécuté une seule fois au montage (écran considéré comme affiché).
jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { mockRouter } = jest.requireActual('./test-utils/router');
  // Navigateurs : rendus comme des éléments hôtes pour inspecter leurs écrans.
  const navigator = (name: string) => {
    function Navigator({ children, ...props }: { children?: unknown }) {
      return React.createElement(name, props, children);
    }
    Navigator.Screen = function Screen(props: object) {
      return React.createElement(`${name}.Screen`, props);
    };
    return Navigator;
  };
  return {
    Stack: navigator('Stack'),
    Tabs: navigator('Tabs'),
    SplashScreen: { preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() },
    useRouter: () => mockRouter,
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: (effect: () => void | (() => void)) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(() => effect(), []);
    },
  };
});

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

// SafeAreaView de react-native est déprécié (écrans à migrer vers
// react-native-safe-area-context) : on masque cet avertissement connu.
const originalWarn = console.warn;
console.warn = (message?: unknown, ...rest: unknown[]) => {
  if (typeof message === 'string' && message.startsWith('SafeAreaView has been deprecated')) return;
  originalWarn(message, ...rest);
};
