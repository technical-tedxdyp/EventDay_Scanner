import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/utils/theme';

type ActivityItemProps = {
  name: string;
  ticketId: string;
  status: 'valid' | 'invalid' | 'duplicate';
  time: Date;
};

const STATUS_CONFIG = {
  valid: { label: 'VALID', color: COLORS.primary, bg: 'rgba(255,59,59,0.1)' },
  invalid: { label: 'DENIED', color: COLORS.primaryGlow, bg: 'rgba(255,0,0,0.1)' },
  duplicate: { label: 'DUPLICATE', color: COLORS.accent, bg: 'rgba(255,122,0,0.1)' },
};

export function ActivityItem({ name, ticketId, status, time }: ActivityItemProps) {
  const cfg = STATUS_CONFIG[status];
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: cfg.color }]} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.ticketId}>{ticketId}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.time}>{timeStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,59,59,0.06)',
  },
  indicator: {
    width: 3,
    height: 32,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ticketId: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs - 1,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
