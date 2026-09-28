import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '@/utils/theme';
import { APP_NAME } from '@/utils/constants';
import { useScanner } from '@/hooks/useScanner';
import { NeonButton } from '@/components/NeonButton';
import { GlassCard } from '@/components/GlassCard';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = Math.min(width * 0.72, 280);
const CORNER_SIZE = 28;
const CORNER_WIDTH = 4;

export default function ScannerScreen() {
  const { isScanning, error, performQrScan, performScan } = useScanner();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualTicketId, setManualTicketId] = useState('');
  const insets = useSafeAreaInsets();
  const scanlineY = useRef(new Animated.Value(0)).current;
  const cornerPulse = useRef(new Animated.Value(0.5)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted && Platform.OS !== 'web') {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanlineY, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanlineY, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(cornerPulse, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Reset scanned flag when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
    }, [])
  );

  const handleBarCodeScanned = ({ data, bounds }: { data: string; bounds?: any }) => {
    if (scanned || isScanning) return;

    if (bounds && bounds.origin && Platform.OS !== 'web') {
      const { x, y } = bounds.origin;
      const minX = (width - FRAME_SIZE) / 2 - 40;
      const maxX = minX + FRAME_SIZE + 40;
      const minY = (height - FRAME_SIZE) / 2 - 40;
      const maxY = minY + FRAME_SIZE + 40;

      if (x < minX || x > maxX || y < minY || y > maxY) {
        return;
      }
    }

    setScanned(true);
    performQrScan(data);
  };

  const handleManualSubmit = () => {
    if (manualTicketId.trim()) {
      setManualModalVisible(false);
      setScanned(true);
      performQrScan(manualTicketId.trim());
      setManualTicketId('');
    }
  };

  const scanlineTranslate = scanlineY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 4],
  });

  return (
    <Animated.View style={[s.container, { opacity: fadeIn }]}>
      {/* Full-screen camera background */}
      <View style={s.cameraFull}>
        {permission?.granted || Platform.OS === 'web' ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        ) : (
          <View style={s.cameraPlaceholder}>
            <Text style={s.placeholderIcon}>📷</Text>
            <Text style={s.placeholderText}>CAMERA ACCESS REQUIRED</Text>
            <NeonButton
              title="GRANT ACCESS"
              onPress={requestPermission}
              variant="secondary"
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        )}

        {/* Dark overlay with transparent cutout and glowing red frame */}
        <View style={s.overlayContainer} pointerEvents="none">
          <View style={s.overlayCutout} />

          <View style={s.frameContainer}>
            <Animated.View style={[s.frameCorners, { opacity: cornerPulse }]}>
              <View style={[s.corner, s.cTL]} />
              <View style={[s.corner, s.cTR]} />
              <View style={[s.corner, s.cBL]} />
              <View style={[s.corner, s.cBR]} />
            </Animated.View>
            <Animated.View
              style={[s.scanLine, { transform: [{ translateY: scanlineTranslate }] }]}
            />
            <View style={s.crossH} />
            <View style={s.crossV} />
          </View>
        </View>
      </View>

      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={s.topRow}>
          <Text style={s.topTitle}>{APP_NAME}</Text>
          <TouchableOpacity
            style={s.manualBtn}
            onPress={() => setManualModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={s.manualBtnText}>⌨ MANUAL CODE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scanner label */}
      <View style={s.scanArea} pointerEvents="none">
        <Text style={s.frameLbl}>{isScanning ? 'PROCESSING...' : 'ALIGN QR CODE'}</Text>
      </View>

      {/* Processing overlay */}
      {isScanning && (
        <View style={s.procFullOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.procText}>VALIDATING TICKET WITH SERVER...</Text>
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View style={s.errBanner}>
          <Text style={s.errText}>⚠ {error}</Text>
        </View>
      )}

      {/* Bottom controls */}
      <View style={s.bottomCtrl}>
        <Text style={s.instrText}>POINT CAMERA AT QR CODE OR ENTER TICKET ID</Text>
        <TouchableOpacity
          style={s.quickSimBtn}
          onPress={() => performScan()}
          activeOpacity={0.7}
        >
          <Text style={s.quickSimText}>TEST SIMULATION SCAN</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={manualModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setManualModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <GlassCard glowIntensity="strong" style={s.modalCard}>
            <Text style={s.modalTitle}>MANUAL TICKET ENTRY</Text>
            <Text style={s.modalSub}>ENTER TICKET ID OR BOOKING REFERENCE</Text>

            <TextInput
              style={s.modalInput}
              placeholder="e.g. TEDX-2026-ABC123"
              placeholderTextColor={COLORS.textMuted}
              value={manualTicketId}
              onChangeText={setManualTicketId}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
            />

            <View style={s.modalActions}>
              <NeonButton
                title="VERIFY & ADMIT"
                onPress={handleManualSubmit}
                disabled={!manualTicketId.trim()}
              />
              <View style={{ height: SPACING.sm }} />
              <NeonButton
                title="CANCEL"
                variant="secondary"
                onPress={() => setManualModalVisible(false)}
              />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </Animated.View>
  );
}

const OVERLAY_OPACITY = 0.75;
const OVERLAY_BORDER = 1000;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  cameraFull: { ...StyleSheet.absoluteFillObject },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 48, marginBottom: SPACING.md },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 3,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCutout: {
    width: FRAME_SIZE + OVERLAY_BORDER * 2,
    height: FRAME_SIZE + OVERLAY_BORDER * 2,
    borderWidth: OVERLAY_BORDER,
    borderColor: `rgba(0,0,0,${OVERLAY_OPACITY})`,
    position: 'absolute',
  },
  topBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.mega,
    fontWeight: '900',
    letterSpacing: 8,
  },
  manualBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  manualBtnText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  frameContainer: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameCorners: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  cTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: COLORS.scannerFrame,
    borderTopLeftRadius: 4,
  },
  cTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: COLORS.scannerFrame,
    borderTopRightRadius: 4,
  },
  cBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: COLORS.scannerFrame,
    borderBottomLeftRadius: 4,
  },
  cBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: COLORS.scannerFrame,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: CORNER_SIZE / 2,
    right: CORNER_SIZE / 2,
    top: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    ...SHADOW.glow,
  },
  crossH: { position: 'absolute', width: 28, height: 1, backgroundColor: COLORS.primary, opacity: 0.4 },
  crossV: { position: 'absolute', width: 1, height: 28, backgroundColor: COLORS.primary, opacity: 0.4 },
  frameLbl: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  procFullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  procText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: SPACING.md,
  },
  errBanner: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(255,59,59,0.1)',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    zIndex: 10,
  },
  errText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  bottomCtrl: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 24,
    paddingTop: SPACING.md,
    alignItems: 'center',
    zIndex: 10,
  },
  instrText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  quickSimBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  quickSimText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalCard: {
    padding: SPACING.xl,
  },
  modalTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  modalSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  modalInput: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.sm,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    letterSpacing: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalActions: {
    gap: SPACING.sm,
  },
});
