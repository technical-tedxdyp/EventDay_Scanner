import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from '@/utils/theme';

type ActivityItemProps = {
  name: string;
  ticketId: string;
  status: 'valid' | 'invalid' | 'duplicate';
  time: Date;
};

const STATUS_CONFIG = {
  valid: { label: 'ADMITTED', color: COLORS.success },
  invalid: { label: 'DENIED', color: COLORS.textDanger },
  duplicate: { label: 'DUPLICATE', color: COLORS.warning },
};

export function ActivityItem({ name, ticketId, status, time }: ActivityItemProps) {
  const cfg = STATUS_CONFIG[status];
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: cfg.color }]} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.ticketId} numberOfLines={1} ellipsizeMode="middle">
          {ticketId}
        </Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, { borderColor: cfg.color }]}>
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
    borderBottomColor: 'rgba(10, 10, 10, 0.08)',
  },
  indicator: {
    width: 4,
    height: 36,
    borderRadius: 0,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ticketId: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 10, 10, 0.12)',
    marginBottom: 3,
  },
  badgeText: {
    fontFamily: FONT_FAMILY.sans,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  time: {
    fontFamily: FONT_FAMILY.sans,
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
