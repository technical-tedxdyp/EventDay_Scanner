import { COLORS } from '@/utils/theme';
import { Tabs } from 'expo-router';
import {
    ChartNoAxesCombined,
    QrCode,
    ScanLine,
} from 'lucide-react-native';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type TabIconProps = {
    focused: boolean;
    type: 'scanner' | 'analytics';
};

function TabIcon({
    focused,
    type,
}: TabIconProps) {
    const Icon =
        type === 'scanner'
            ? QrCode
            : ChartNoAxesCombined;

    return (
        <View style={styles.tabItem}>
            <Icon
                size={26}
                strokeWidth={focused ? 2.5 : 2}
                color={
                    focused
                        ? COLORS.primary
                        : COLORS.dark
                }
            />
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.dark,
                tabBarItemStyle: styles.tabBarItem,
            }}
        >
            <Tabs.Screen
                name="scanner"
                options={{
                    tabBarAccessibilityLabel: 'Scanner',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            type="scanner"
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="analytics"
                options={{
                    tabBarAccessibilityLabel: 'Analytics',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            type="analytics"
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: "white",
        // borderTopWidth: 0.5,
        // borderTopColor: COLORS.dark,
        height: Platform.OS === 'ios' ? 92 : 72,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 20 : 6,
        elevation: 0,
        shadowOpacity: 0,
    },

    tabBarItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: Platform.OS === 'ios' ? 62 : 56,
        paddingTop: 2,
    },

    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },

    tabLabel: {
        marginTop: 4,
        fontSize: 9,
        fontWeight: '700',
        color: COLORS.dark,
        letterSpacing: 1.2,
    },

    tabLabelActive: {
        color: COLORS.primary,
    },

    activeDot: {
        width: 8,
        height: 4,
        borderRadius: 0,
        backgroundColor: COLORS.primary,
        marginTop: 3,
    },
});
