import { NodeVM, VMScript } from 'vm2'
import { prisma } from '@lexoria/database'
import { calculateLevel } from '../utils/xp'
import { checkAndAwardAchievements } from './achievements.service'

const EXECUTION_TIMEOUT_MS = 5000
const MAX_OUTPUT_LINES = 200

// ── Run code in a secure sandbox ─────────────────────────────────
export const executeCode = async (code: string) => {
  const outputLines: string[] = []
  let errorMessage = ''

  const vm = new NodeVM({
    timeout: EXECUTION_TIMEOUT_MS,
    sandbox: {},
    require: false,
    eval: false,
    wasm: false,
    console: 'redirect',
    vm: { runInThisContext: false },
  })

  // Redirect console.log to our collector
  vm.on('console.log', (...args: any[]) => {
    if (outputLines.length < MAX_OUTPUT_LINES) {
      outputLines.push(args.map(String).join(' '))
    }
  })

  vm.on('console.error', (...args: any[]) => {
    errorMessage = args.map(String).join(' ')
  })

  vm.on('console.warn', (...args: any[]) => {
    if (outputLines.length < MAX_OUTPUT_LINES) {
      outputLines.push('[warn] ' + args.map(String).join(' '))
    }
  })

  try {
    const script = new VMScript(code)
    vm.run(script)

    return {
      success: true,
      output: outputLines.join('\n'),
      error: errorMessage,
      statusDescription: 'Accepted',
    }
  } catch (err: any) {
    const message: string = err.message || 'Unknown error'

    // Friendly error messages
    if (message.includes('Script execution timed out')) {
      return {
        success: false,
        output: outputLines.join('\n'),
        error: 'Your code took too long to run. Check for infinite loops.',
        statusDescription: 'Time Limit Exceeded',
      }
    }

    return {
      success: false,
      output: outputLines.join('\n'),
      error: message,
      statusDescription: 'Runtime Error',
    }
  }
}

// ── Run code against challenge test cases ─────────────────────────
export const submitChallenge = async (
  userId: string,
  challengeId: string,
  userCode: string
) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { chapter: { include: { season: true } } },
  })

  if (!challenge) throw new Error('CHALLENGE_NOT_FOUND')

  // Check if already passed — don't double award XP
  const alreadyPassed = await prisma.challengeAttempt.findFirst({
    where: { userId, challengeId, passed: true },
  })

  const testCases = challenge.testCases as Array<{
    description: string
    check: string
  }>

  const { results, userOutput, errorOutput } = runWithTests(userCode, testCases)
  const allPassed = results.every((r) => r.passed)
  const passedCount = results.filter((r) => r.passed).length

  // XP: full if all passed (and not already passed), partial for partial
  const xpEarned = alreadyPassed
    ? 0
    : allPassed
    ? challenge.xpReward
    : Math.floor((passedCount / testCases.length) * challenge.xpReward * 0.5)

  // Record the attempt
  await prisma.challengeAttempt.create({
    data: {
      userId,
      challengeId,
      code: userCode,
      passed: allPassed,
      output: userOutput,
      xpEarned,
    },
  })

  // Award XP if passed and not previously awarded
  if (allPassed && !alreadyPassed && xpEarned > 0) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { totalXP: { increment: xpEarned } },
    })

    const newLevel = calculateLevel(updatedUser.totalXP)
    if (newLevel !== updatedUser.level) {
      await prisma.user.update({ where: { id: userId }, data: { level: newLevel } })
    }

    await prisma.userSubjectXP.upsert({
      where: {
        userId_subjectId: { userId, subjectId: challenge.chapter.season.subjectId },
      },
      create: { userId, subjectId: challenge.chapter.season.subjectId, xp: xpEarned, level: 1 },
      update: { xp: { increment: xpEarned } },
    })

    const newAchievements = await checkAndAwardAchievements(userId)

    return {
      passed: true,
      results,
      output: userOutput,
      error: errorOutput,
      xpEarned,
      newTotalXP: updatedUser.totalXP + xpEarned,
      levelUp: newLevel !== updatedUser.level,
      newLevel,
      newAchievements,
    }
  }

  return {
    passed: allPassed,
    results,
    output: userOutput,
    error: errorOutput,
    xpEarned: 0,
  }
}

// ── Run user code + tests in the sandbox ──────────────────────────
const runWithTests = (
  userCode: string,
  testCases: Array<{ description: string; check: string }>
) => {
  const outputLines: string[] = []
  let errorOutput = ''

  const vm = new NodeVM({
    timeout: EXECUTION_TIMEOUT_MS,
    sandbox: {},
    require: false,
    eval: false,
    wasm: false,
    console: 'redirect',
  })

  vm.on('console.log', (...args: any[]) => {
    if (outputLines.length < MAX_OUTPUT_LINES) {
      outputLines.push(args.map(String).join(' '))
    }
  })

  // Variables declared in user code that we want to test
  // We extract them by running in a context that exposes the scope
  const scopeExtractor = `
    module.exports = (function() {
      const __captured = {};
      const __logs = [];

      // Override console to capture output
      const __fakeConsole = {
        log: (...args) => __logs.push(args.map(String).join(' ')),
        error: (...args) => __logs.push('[error] ' + args.map(String).join(' ')),
        warn: (...args) => __logs.push('[warn] ' + args.map(String).join(' ')),
      };

      try {
        (function(console) {
          ${userCode}

          // Capture all variables by trying to access them
          try { if (typeof cityName !== 'undefined') __captured.cityName = cityName; } catch(e) {}
          try { if (typeof towerName !== 'undefined') __captured.towerName = towerName; } catch(e) {}
          try { if (typeof towerLevel !== 'undefined') __captured.towerLevel = towerLevel; } catch(e) {}
          try { if (typeof isActive !== 'undefined') __captured.isActive = isActive; } catch(e) {}
          try { if (typeof citizenName !== 'undefined') __captured.citizenName = citizenName; } catch(e) {}
          try { if (typeof citizenAge !== 'undefined') __captured.citizenAge = citizenAge; } catch(e) {}
          try { if (typeof isAwake !== 'undefined') __captured.isAwake = isAwake; } catch(e) {}
          try { if (typeof hasPass !== 'undefined') __captured.hasPass = hasPass; } catch(e) {}
          try { if (typeof citizenLevel !== 'undefined') __captured.citizenLevel = citizenLevel; } catch(e) {}
          try { if (typeof hasSword !== 'undefined') __captured.hasSword = hasSword; } catch(e) {}
          try { if (typeof gold !== 'undefined') __captured.gold = gold; } catch(e) {}
          try { if (typeof ringsLeft !== 'undefined') __captured.ringsLeft = ringsLeft; } catch(e) {}
        })(__fakeConsole);
      } catch(e) {
        __captured.__error = e.message;
      }

      return { captured: __captured, logs: __logs };
    })();
  `

  let captured: Record<string, any> = {}
  let userOutput = ''

  try {
    const result = vm.run(scopeExtractor) as {
      captured: Record<string, any>
      logs: string[]
    }
    captured = result.captured || {}
    userOutput = result.logs.join('\n')
    outputLines.push(...result.logs)
  } catch (err: any) {
    errorOutput = err.message || 'Runtime error'
    userOutput = outputLines.join('\n')
  }

  const output = userOutput

  // Now run each test case
  const results = testCases.map((tc) => {
    try {
      // Build a safe evaluation context with captured vars + output
      const testVm = new NodeVM({
        timeout: 1000,
        sandbox: { ...captured, output },
        require: false,
        eval: false,
      })

      const testScript = `module.exports = !!(${tc.check});`
      const passed = testVm.run(testScript) as boolean

      return { description: tc.description, passed: !!passed }
    } catch {
      return { description: tc.description, passed: false }
    }
  })

  return { results, userOutput, errorOutput }
}

export const extractUserOutput = (output: string): string => output