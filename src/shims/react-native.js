// shim for react-native to provide missing TurboModuleRegistry
export * from 'react-native-web';
// Mock TurboModuleRegistry for compatibility with react-native-reanimated
export const TurboModuleRegistry = {
  get: (moduleName) => {
    console.warn(`[Shim] TurboModuleRegistry.get(${moduleName}) called - returning null`);
    return null;
  },
};
