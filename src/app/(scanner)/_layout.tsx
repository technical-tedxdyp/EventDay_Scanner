import { Stack } from 'expo-router';
import { COLORS } from '@/utils/theme';

export default function ScannerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
