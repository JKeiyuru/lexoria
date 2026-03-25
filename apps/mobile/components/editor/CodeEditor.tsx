import { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native'
import { api } from '../../lib/api'
import { Colors } from '../../constants/colors'
import React from 'react'

interface Props {
  initialCode?: string
  onResult?: (result: any) => void
}

export function CodeEditor({ initialCode = '', onResult }: Props) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)

  const handleRun = async () => {
    if (!code.trim()) return
    setRunning(true)
    setOutput('')
    setError('')
    try {
      const res = await api.post('/execute/run', { code })
      if (res.data.success) {
        setOutput(res.data.output || '(no output)')
      } else {
        setError(res.data.error || 'Runtime error')
        if (res.data.output) setOutput(res.data.output)
      }
      onResult?.(res.data)
    } catch (err) {
      setError('Could not reach execution server.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Editor */}
      <View style={styles.editorHeader}>
        <Text style={styles.editorLabel}>⚡ Code Editor</Text>
        <TouchableOpacity
          style={[styles.runBtn, running && styles.runBtnDisabled]}
          onPress={handleRun}
          disabled={running}
        >
          {running ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.runBtnText}>▶ Run</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={setCode}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder="// Write your code here..."
        placeholderTextColor={Colors.textMuted}
      />

      {/* Output */}
      {(output || error) && (
        <View style={styles.outputContainer}>
          <Text style={styles.outputLabel}>
            {error ? '❌ Error' : '✅ Output'}
          </Text>
          <ScrollView style={styles.outputScroll} nestedScrollEnabled>
            {output && <Text style={styles.outputText}>{output}</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1117',
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    marginVertical: 8,
  },
  editorHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  editorLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  runBtn: {
    backgroundColor: Colors.accentGreen,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, minWidth: 70, alignItems: 'center',
  },
  runBtnDisabled: { opacity: 0.6 },
  runBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  codeInput: {
    color: '#E6EDF3', fontFamily: 'monospace',
    fontSize: 14, lineHeight: 22,
    padding: 14, minHeight: 180,
    textAlignVertical: 'top',
  },
  outputContainer: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  outputLabel: {
    color: Colors.textSecondary, fontSize: 11,
    fontWeight: '700', padding: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  outputScroll: { maxHeight: 120, padding: 12 },
  outputText: { color: '#E6EDF3', fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  errorText: { color: Colors.error, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
})