import { Redirect } from 'expo-router';

// Scanner UI is now in /(tabs)/scanner. This redirect handles legacy deep links.
export default function ScannerRedirect() {
  return <Redirect href="/(tabs)/scanner" />;
}
