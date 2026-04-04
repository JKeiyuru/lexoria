import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  TextInput, Alert,
} from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth.store'
import { Colors } from '../constants/colors'
import React from 'react'

export default function GuildScreen() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [guildName, setGuildName] = useState('')
  const [guildDesc, setGuildDesc] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: myGuild, isLoading: loadingMine } = useQuery({
    queryKey: ['my-guild', user?.id],
    queryFn: async () => {
      const res = await api.get('/guilds/mine')
      return res.data.membership
    },
    enabled: !!user,
  })

  const { data: allGuilds, isLoading: loadingAll } = useQuery({
    queryKey: ['all-guilds'],
    queryFn: async () => {
      const res = await api.get('/guilds')
      return res.data.guilds
    },
    enabled: !!user && !myGuild,
  })

  const handleCreate = async () => {
    if (guildName.trim().length < 3) {
      Alert.alert('Error', 'Guild name must be at least 3 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/guilds/create', { name: guildName.trim(), description: guildDesc.trim() })
      queryClient.invalidateQueries({ queryKey: ['my-guild'] })
      setCreating(false)
      setGuildName('')
      setGuildDesc('')
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not create guild')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (guildId: string) => {
    setLoading(true)
    try {
      await api.post(`/guilds/${guildId}/join`)
      queryClient.invalidateQueries({ queryKey: ['my-guild'] })
      queryClient.invalidateQueries({ queryKey: ['all-guilds'] })
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not join guild')
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = () => {
    Alert.alert('Leave Guild', 'Are you sure you want to leave your guild?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/guilds/leave')
            queryClient.invalidateQueries({ queryKey: ['my-guild'] })
            queryClient.invalidateQueries({ queryKey: ['all-guilds'] })
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Could not leave guild')
          }
        },
      },
    ])
  }

  if (!user || loadingMine) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  // User is in a guild
  if (myGuild) {
    const guild = myGuild.guild
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>⚔️ My Guild</Text>

        <View style={styles.guildHeader}>
          <Text style={styles.guildName}>{guild.name}</Text>
          {guild.description && (
            <Text style={styles.guildDesc}>{guild.description}</Text>
          )}
          <View style={styles.guildStats}>
            <View style={styles.guildStat}>
              <Text style={styles.guildStatValue}>{guild.totalXP}</Text>
              <Text style={styles.guildStatLabel}>Guild XP</Text>
            </View>
            <View style={styles.guildStat}>
              <Text style={styles.guildStatValue}>{guild.members.length}</Text>
              <Text style={styles.guildStatLabel}>Members</Text>
            </View>
            <View style={styles.guildStat}>
              <Text style={styles.guildStatValue}>{myGuild.role}</Text>
              <Text style={styles.guildStatLabel}>Your Role</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Members</Text>
        {guild.members.map((member: any, index: number) => (
          <View key={member.id} style={styles.memberRow}>
            <Text style={styles.memberRank}>#{index + 1}</Text>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {member.user.username}
                {member.user.id === user.id ? ' (You)' : ''}
              </Text>
              <Text style={styles.memberLevel}>Level {member.user.level}</Text>
            </View>
            <View style={styles.memberRight}>
              {member.role === 'LEADER' && (
                <View style={styles.leaderBadge}>
                  <Text style={styles.leaderBadgeText}>Leader</Text>
                </View>
              )}
              <Text style={styles.memberXP}>{member.user.totalXP} XP</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.leaveBtnText}>Leave Guild</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  // User has no guild
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>⚔️ Guilds</Text>
      <Text style={styles.subtitle}>Join a guild to compete and learn together</Text>

      {/* Create guild */}
      {!creating ? (
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCreating(true)}
        >
          <Text style={styles.createBtnText}>+ Create New Guild</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.createForm}>
          <Text style={styles.formTitle}>Create a Guild</Text>
          <TextInput
            style={styles.input}
            value={guildName}
            onChangeText={setGuildName}
            placeholder="Guild name (min 3 chars)"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={guildDesc}
            onChangeText={setGuildDesc}
            placeholder="Description (optional)"
            placeholderTextColor={Colors.textMuted}
          />
          <View style={styles.formBtns}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setCreating(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.submitBtnText}>Create</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* All guilds */}
      <Text style={styles.sectionTitle}>All Guilds</Text>
      {loadingAll ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        allGuilds?.map((guild: any) => (
          <View key={guild.id} style={styles.guildCard}>
            <View style={styles.guildCardLeft}>
              <Text style={styles.guildCardName}>{guild.name}</Text>
              <Text style={styles.guildCardMeta}>
                {guild._count?.members} members · {guild.totalXP} XP
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.joinBtn, loading && styles.disabledBtn]}
              onPress={() => handleJoin(guild.id)}
              disabled={loading}
            >
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 24 },
  guildHeader: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  guildName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  guildDesc: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  guildStats: { flexDirection: 'row', justifyContent: 'space-around' },
  guildStat: { alignItems: 'center' },
  guildStatValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  guildStatLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  memberRow: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  memberRank: { color: Colors.textMuted, fontSize: 14, width: 24 },
  memberInfo: { flex: 1 },
  memberName: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  memberLevel: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  memberRight: { alignItems: 'flex-end', gap: 4 },
  leaderBadge: {
    backgroundColor: Colors.accent + '22', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.accent,
  },
  leaderBadgeText: { color: Colors.accent, fontSize: 10, fontWeight: '700' },
  memberXP: { color: Colors.textMuted, fontSize: 12 },
  leaveBtn: {
    borderWidth: 1, borderColor: Colors.error + '44',
    borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16,
  },
  leaveBtnText: { color: Colors.error, fontWeight: '600' },
  createBtn: {
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: 12, padding: 16, alignItems: 'center',
    marginBottom: 24, borderStyle: 'dashed',
  },
  createBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  createForm: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  formTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 14 },
  input: {
    backgroundColor: Colors.background, borderWidth: 1,
    borderColor: Colors.border, borderRadius: 10,
    padding: 12, color: Colors.textPrimary,
    fontSize: 15, marginBottom: 10,
  },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  submitBtn: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  disabledBtn: { opacity: 0.6 },
  guildCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 16, marginBottom: 10, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  guildCardLeft: { flex: 1 },
  guildCardName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  guildCardMeta: { color: Colors.textMuted, fontSize: 13 },
  joinBtn: {
    backgroundColor: Colors.primary + '22', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary,
  },
  joinBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
})