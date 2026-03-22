import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Lexoria database...')

  // ── SUBJECTS ──────────────────────────────────────────────────────
  const javascript = await prisma.subject.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: {
      name: 'JavaScript',
      slug: 'javascript',
      description: 'Learn programming by mastering the language of the web.',
      color: '#F7DF1E',
      storyWorld: 'The City of Logic',
      isFree: true,
      orderIndex: 0,
    },
  })

  const mathematics = await prisma.subject.upsert({
    where: { slug: 'mathematics' },
    update: {},
    create: {
      name: 'Mathematics',
      slug: 'mathematics',
      description: 'Unlock the patterns that govern the universe.',
      color: '#3498DB',
      storyWorld: 'The Infinite Citadel',
      isFree: false,
      orderIndex: 1,
    },
  })

  const biology = await prisma.subject.upsert({
    where: { slug: 'biology' },
    update: {},
    create: {
      name: 'Biology',
      slug: 'biology',
      description: 'Explore the living world from cell to ecosystem.',
      color: '#2ECC71',
      storyWorld: 'The Living Realm',
      isFree: false,
      orderIndex: 2,
    },
  })

  const physics = await prisma.subject.upsert({
    where: { slug: 'physics' },
    update: {},
    create: {
      name: 'Physics',
      slug: 'physics',
      description: 'Bend the laws of reality and master the forces of nature.',
      color: '#9B59B6',
      storyWorld: 'The Force Fields',
      isFree: false,
      orderIndex: 3,
    },
  })

  await prisma.subject.upsert({
    where: { slug: 'chemistry' },
    update: {},
    create: {
      name: 'Chemistry',
      slug: 'chemistry',
      description: 'Transmute elements and master the art of reactions.',
      color: '#E67E22',
      storyWorld: "The Alchemist's Crucible",
      isFree: false,
      orderIndex: 4,
    },
  })

  await prisma.subject.upsert({
    where: { slug: 'genetics' },
    update: {},
    create: {
      name: 'Genetics',
      slug: 'genetics',
      description: 'Decode the blueprint of life itself.',
      color: '#E74C3C',
      storyWorld: 'The Code of Life',
      isFree: false,
      orderIndex: 5,
    },
  })

  console.log('✅ Subjects created')

  // ── JAVASCRIPT SEASON 1 ───────────────────────────────────────────
  const season1 = await prisma.season.upsert({
    where: { id: 'season-js-1' },
    update: {},
    create: {
      id: 'season-js-1',
      subjectId: javascript.id,
      title: 'Season 1: The City of Logic',
      description: 'A city frozen in chaos. Only you can restore order — one line of code at a time.',
      storyArc: 'The City of Logic has lost its memory. Variables are missing, conditions have collapsed, and the city loops endlessly. You are the last Coder, summoned to restore the city.',
      orderIndex: 0,
      isFree: true,
    },
  })

  console.log('✅ Season 1 created')

  // ── CHAPTER 1: VARIABLES ──────────────────────────────────────────
  const chapter1 = await prisma.chapter.upsert({
    where: { id: 'ch-js-1-1' },
    update: {},
    create: {
      id: 'ch-js-1-1',
      seasonId: season1.id,
      title: 'Chapter 1: The City Without Memory',
      conceptTaught: 'Variables & Data Types',
      orderIndex: 0,
      xpReward: 100,
      isFree: true,
      storyContent: {
        intro: "You arrive at the gates of the City of Logic. The streets are silent. Citizens wander aimlessly — they've forgotten their own names. The city's Memory Towers have gone dark.",
        scene: "Elder Syntax, the last surviving architect, greets you at the gate. Her eyes are desperate. 'Coder,' she whispers, 'the city has lost all memory. Nothing is stored. Nothing is remembered. The citizens don't know who they are, what they carry, or where they're going.'",
        mission: "Your first mission: restore the Memory Towers by teaching the city how to store information again. You must learn to create variables — containers that hold the city's memories.",
        dialogue: [
          { character: "Elder Syntax", text: "A variable is like a named box. You give it a name, and you put something inside it. That's all memory is — a name and a value." },
          { character: "You", text: "So if I write: let cityName = 'Logic City' — the city remembers its name?" },
          { character: "Elder Syntax", text: "Exactly. 'let' creates the box. 'cityName' is the label. 'Logic City' is what's inside. Simple. Powerful. The foundation of everything." }
        ],
        outro: "You raise your hands and write your first variable. A light flickers in the first Memory Tower. One citizen stops wandering — she remembers her name."
      },
      technicalContent: {
        explanation: "Variables are containers for storing data values. In JavaScript, you declare variables using let, const, or var.",
        keyPoints: [
          "Use 'let' for values that can change",
          "Use 'const' for values that never change",
          "Variable names are case-sensitive",
          "Names can contain letters, numbers, _ and $, but cannot start with a number"
        ],
        examples: [
          { code: "let playerName = 'Alex';\nconsole.log(playerName); // Alex", explanation: "Declaring a string variable" },
          { code: "let score = 0;\nscore = score + 10;\nconsole.log(score); // 10", explanation: "A number variable that changes" },
          { code: "const MAX_LEVEL = 50;\nconsole.log(MAX_LEVEL); // 50", explanation: "A constant that never changes" },
          { code: "let isLoggedIn = true;\nlet health = 100;\nlet username = 'Hero';\nconsole.log(typeof isLoggedIn); // boolean\nconsole.log(typeof health);    // number\nconsole.log(typeof username);  // string", explanation: "The three core data types" }
        ],
        summary: "Variables store information. let allows reassignment. const does not. Every variable has a data type: string (text), number, or boolean (true/false)."
      },
    },
  })

  // Chapter 1 Challenges
  await prisma.challenge.upsert({
    where: { id: 'ch-js-1-1-mini-1' },
    update: {},
    create: {
      id: 'ch-js-1-1-mini-1',
      chapterId: chapter1.id,
      title: 'Name the City',
      description: 'The city has forgotten its name. Store it in a variable.',
      type: 'MINI',
      prompt: "Create a variable called 'cityName' and assign it the value 'Logic City'. Then log it to the console.",
      starterCode: "// Create your variable here\n\n// Log it to the console\n",
      solution: "let cityName = 'Logic City';\nconsole.log(cityName);",
      xpReward: 20,
      orderIndex: 0,
      testCases: [
        { description: "cityName exists", check: "typeof cityName !== 'undefined'" },
        { description: "cityName equals 'Logic City'", check: "cityName === 'Logic City'" },
        { description: "Output contains 'Logic City'", check: "output.includes('Logic City')" }
      ],
    },
  })

  await prisma.challenge.upsert({
    where: { id: 'ch-js-1-1-mini-2' },
    update: {},
    create: {
      id: 'ch-js-1-1-mini-2',
      chapterId: chapter1.id,
      title: 'The Three Citizens',
      description: 'Restore memory to three lost citizens.',
      type: 'MINI',
      prompt: "Create three variables:\n- 'citizenName' set to any string (a name)\n- 'citizenAge' set to any number\n- 'isAwake' set to true\n\nLog all three to the console.",
      starterCode: "// Restore the three citizens' memories\n\n",
      solution: "let citizenName = 'Aria';\nlet citizenAge = 25;\nlet isAwake = true;\nconsole.log(citizenName);\nconsole.log(citizenAge);\nconsole.log(isAwake);",
      xpReward: 25,
      orderIndex: 1,
      testCases: [
        { description: "citizenName is a string", check: "typeof citizenName === 'string'" },
        { description: "citizenAge is a number", check: "typeof citizenAge === 'number'" },
        { description: "isAwake is a boolean", check: "typeof isAwake === 'boolean'" }
      ],
    },
  })

  await prisma.challenge.upsert({
    where: { id: 'ch-js-1-1-boss' },
    update: {},
    create: {
      id: 'ch-js-1-1-boss',
      chapterId: chapter1.id,
      title: 'BOSS: Restore the Memory Tower',
      description: 'The final test. Restore the primary Memory Tower.',
      type: 'BOSS',
      prompt: "The Memory Tower needs 5 pieces of information to restart:\n1. A variable 'towerName' = 'Tower Alpha'\n2. A variable 'towerLevel' = 1\n3. A variable 'isActive' = false (it's not active yet)\n4. Change 'towerLevel' to 5 (towers level up when restored)\n5. Change 'isActive' to true\n\nLog towerName, towerLevel, and isActive to the console (in that order).",
      starterCode: "// Restore the Memory Tower\n// Step 1: Create the variables\n\n// Step 2: Update towerLevel to 5\n\n// Step 3: Set isActive to true\n\n// Step 4: Log all three\n",
      solution: "let towerName = 'Tower Alpha';\nlet towerLevel = 1;\nlet isActive = false;\ntowerLevel = 5;\nisActive = true;\nconsole.log(towerName);\nconsole.log(towerLevel);\nconsole.log(isActive);",
      xpReward: 75,
      orderIndex: 2,
      testCases: [
        { description: "towerName equals 'Tower Alpha'", check: "towerName === 'Tower Alpha'" },
        { description: "towerLevel equals 5", check: "towerLevel === 5" },
        { description: "isActive equals true", check: "isActive === true" },
        { description: "Output: Tower Alpha, 5, true", check: "output.includes('Tower Alpha') && output.includes('5') && output.includes('true')" }
      ],
    },
  })

  console.log('✅ Chapter 1 created with challenges')

  // ── CHAPTER 2: CONDITIONALS ───────────────────────────────────────
  const chapter2 = await prisma.chapter.upsert({
    where: { id: 'ch-js-1-2' },
    update: {},
    create: {
      id: 'ch-js-1-2',
      seasonId: season1.id,
      title: 'Chapter 2: The Gatekeepers',
      conceptTaught: 'Conditionals (if/else)',
      orderIndex: 1,
      xpReward: 120,
      isFree: true,
      storyContent: {
        intro: "With memory restored, the city begins to wake up. But a new crisis emerges — the city's gates have lost their judgment. Every gate is either permanently open or permanently locked. Chaos floods the streets.",
        scene: "The Gatekeeper Guild meets you at the central plaza. Their leader, a tall figure named Branchy, shakes his head. 'Without conditions, there is no decision. Without decision, there is no order. Everything is all-or-nothing.'",
        mission: "Learn the art of conditionals — the ability to make decisions based on whether something is true or false. Restore judgment to the city's gates.",
        dialogue: [
          { character: "Branchy", text: "A conditional says: IF something is true, do this. OTHERWISE, do that. It's the most powerful idea in the city." },
          { character: "You", text: "Like a gate that only opens for citizens with the right pass?" },
          { character: "Branchy", text: "Exactly. IF pass is valid, open gate. ELSE, keep it locked. Simple logic. Perfect order." }
        ],
        outro: "You write your first conditional. The eastern gate tests every citizen — valid pass: enter. No pass: wait. The city begins breathing again."
      },
      technicalContent: {
        explanation: "Conditionals allow your program to make decisions. The if/else statement runs different code depending on whether a condition is true or false.",
        keyPoints: [
          "if (condition) { } runs code only when condition is true",
          "else { } runs when the condition is false",
          "else if (condition) { } lets you chain multiple conditions",
          "Comparison operators: === (equal), !== (not equal), > , < , >= , <="
        ],
        examples: [
          { code: "let hasPass = true;\nif (hasPass) {\n  console.log('Gate opens');\n} else {\n  console.log('Gate stays locked');\n}", explanation: "Basic if/else" },
          { code: "let score = 85;\nif (score >= 90) {\n  console.log('Grade: A');\n} else if (score >= 70) {\n  console.log('Grade: B');\n} else {\n  console.log('Grade: C');\n}", explanation: "Chained else if" }
        ],
        summary: "if/else gives your code the power to decide. The condition inside if() must evaluate to true or false."
      },
    },
  })

  await prisma.challenge.upsert({
    where: { id: 'ch-js-1-2-mini-1' },
    update: {},
    create: {
      id: 'ch-js-1-2-mini-1',
      chapterId: chapter2.id,
      title: 'The First Gate',
      description: 'Write the logic for the eastern gate.',
      type: 'MINI',
      prompt: "A citizen arrives at the gate. They have a variable 'hasPass' set to true.\nWrite an if/else statement: if hasPass is true, log 'Welcome, citizen'. Otherwise log 'Access denied'.",
      starterCode: "let hasPass = true;\n\n// Write your if/else here\n",
      solution: "let hasPass = true;\nif (hasPass) {\n  console.log('Welcome, citizen');\n} else {\n  console.log('Access denied');\n}",
      xpReward: 25,
      orderIndex: 0,
      testCases: [
        { description: "Outputs 'Welcome, citizen' when hasPass is true", check: "output.includes('Welcome, citizen')" }
      ],
    },
  })

  await prisma.challenge.upsert({
    where: { id: 'ch-js-1-2-boss' },
    update: {},
    create: {
      id: 'ch-js-1-2-boss',
      chapterId: chapter2.id,
      title: 'BOSS: The Three Gates',
      description: 'The city has three gates. Each has a different rule.',
      type: 'BOSS',
      prompt: "You must write the logic for three gates:\n\nGate 1: variable 'citizenLevel' = 3. If level >= 5, log 'Gate 1: Enter'. Else log 'Gate 1: Too low'.\nGate 2: variable 'hasSword' = false. If hasSword is true, log 'Gate 2: Armed entry'. Else log 'Gate 2: Safe entry'.\nGate 3: variable 'gold' = 120. If gold > 200, log 'Gate 3: VIP'. Else if gold >= 100, log 'Gate 3: Standard'. Else log 'Gate 3: Denied'.",
      starterCode: "// Gate 1\nlet citizenLevel = 3;\n\n\n// Gate 2\nlet hasSword = false;\n\n\n// Gate 3\nlet gold = 120;\n\n",
      solution: "let citizenLevel = 3;\nif (citizenLevel >= 5) {\n  console.log('Gate 1: Enter');\n} else {\n  console.log('Gate 1: Too low');\n}\n\nlet hasSword = false;\nif (hasSword) {\n  console.log('Gate 2: Armed entry');\n} else {\n  console.log('Gate 2: Safe entry');\n}\n\nlet gold = 120;\nif (gold > 200) {\n  console.log('Gate 3: VIP');\n} else if (gold >= 100) {\n  console.log('Gate 3: Standard');\n} else {\n  console.log('Gate 3: Denied');\n}",
      xpReward: 90,
      orderIndex: 1,
      testCases: [
        { description: "Gate 1 output correct", check: "output.includes('Gate 1: Too low')" },
        { description: "Gate 2 output correct", check: "output.includes('Gate 2: Safe entry')" },
        { description: "Gate 3 output correct", check: "output.includes('Gate 3: Standard')" }
      ],
    },
  })

  console.log('✅ Chapter 2 created with challenges')

  // ── CHAPTER 3: LOOPS ──────────────────────────────────────────────
  const chapter3 = await prisma.chapter.upsert({
    where: { id: 'ch-js-1-3' },
    update: {},
    create: {
      id: 'ch-js-1-3',
      seasonId: season1.id,
      title: 'Chapter 3: The Repeating Curse',
      conceptTaught: 'Loops (for, while)',
      orderIndex: 2,
      xpReward: 140,
      isFree: true,
      storyContent: {
        intro: "Deep in the city's eastern district, something is wrong. Citizens are stuck in endless routines — washing the same wall, walking the same three steps, counting the same coins forever. The Repeating Curse has taken hold.",
        scene: "A young engineer named Loopsy runs to you, breathless. 'They're trapped! They can't stop! They do the same thing over and over without any way to count, control, or end it.'",
        mission: "Learn loops — the controlled art of repetition. Break the curse by teaching the city how to repeat actions a set number of times, and how to know when to stop.",
        dialogue: [
          { character: "Loopsy", text: "A loop says: do this action, again and again, until a condition is met. Without a stopping condition, it runs forever — that's the curse." },
          { character: "You", text: "So I need to give it a start, a rule for continuing, and a way to stop?" },
          { character: "Loopsy", text: "Exactly. for (let i = 0; i < 5; i++) — start at 0, keep going while less than 5, add 1 each time. Five repetitions. Clean stop." }
        ],
        outro: "You cast the loop spell over the eastern district. Citizens count to ten and stop. They sweep five times and rest. The curse is broken — repetition is now a tool, not a prison."
      },
      technicalContent: {
        explanation: "Loops let you run the same block of code multiple times. The for loop is the most common — it has a counter, a condition, and an increment.",
        keyPoints: [
          "for (let i = 0; i < n; i++) runs n times",
          "i starts at 0 by convention (arrays are 0-indexed)",
          "The loop stops when the condition becomes false",
          "while loops run as long as a condition is true",
          "break exits a loop early. continue skips to the next iteration"
        ],
        examples: [
          { code: "for (let i = 0; i < 5; i++) {\n  console.log('Count: ' + i);\n}\n// Count: 0, 1, 2, 3, 4", explanation: "Basic for loop" },
          { code: "let lives = 3;\nwhile (lives > 0) {\n  console.log('Lives remaining: ' + lives);\n  lives--;\n}\n// Lives: 3, 2, 1", explanation: "While loop" }
        ],
        summary: "Loops automate repetition. for loops are best when you know how many times. while loops are best when you don't."
      },
    },
  })

  await prisma.challenge.upsert({
    where: { id: 'ch-js-1-3-boss' },
    update: {},
    create: {
      id: 'ch-js-1-3-boss',
      chapterId: chapter3.id,
      title: 'BOSS: Break the Curse',
      description: 'Use loops to free the three cursed citizens.',
      type: 'BOSS',
      prompt: "Three citizens are cursed. Free them with loops:\n\n1. Citizen A sweeps forever. Make them sweep exactly 5 times — log 'Sweep 1', 'Sweep 2'... 'Sweep 5'.\n2. Citizen B counts coins endlessly. Make them count from 1 to 10, but SKIP number 7 (use continue).\n3. Citizen C rings the alarm. Use a while loop starting at ringsLeft = 4, log 'Ring!' each time and decrease ringsLeft by 1.",
      starterCode: "// Citizen A: Sweep 5 times\n\n\n// Citizen B: Count 1-10, skip 7\n\n\n// Citizen C: while loop, 4 rings\nlet ringsLeft = 4;\n",
      solution: "for (let i = 1; i <= 5; i++) {\n  console.log('Sweep ' + i);\n}\n\nfor (let i = 1; i <= 10; i++) {\n  if (i === 7) continue;\n  console.log(i);\n}\n\nlet ringsLeft = 4;\nwhile (ringsLeft > 0) {\n  console.log('Ring!');\n  ringsLeft--;\n}",
      xpReward: 100,
      orderIndex: 0,
      testCases: [
        { description: "Sweep 5 is logged", check: "output.includes('Sweep 5')" },
        { description: "7 is not in output", check: "!output.split('\\n').map(l => l.trim()).includes('7')" },
        { description: "'Ring!' appears 4 times", check: "(output.match(/Ring!/g) || []).length === 4" }
      ],
    },
  })

  console.log('✅ Chapter 3 created')

  // ── CHAPTER 4: FUNCTIONS ──────────────────────────────────────────
  await prisma.chapter.upsert({
    where: { id: 'ch-js-1-4' },
    update: {},
    create: {
      id: 'ch-js-1-4',
      seasonId: season1.id,
      title: 'Chapter 4: The Spellcasters',
      conceptTaught: 'Functions',
      orderIndex: 3,
      xpReward: 160,
      isFree: false,
      storyContent: {
        intro: "The city is healing. But there's a new problem — every time a task needs doing, someone has to write the instructions from scratch. The city is drowning in repeated instructions.",
        scene: "The Spellcasters' Guild sends their master, Functon, to find you. 'Coder,' she says, 'we need reusable spells. Instructions you write once and cast many times. Without functions, this city will never scale.'",
        mission: "Learn functions — reusable blocks of code. Write it once. Call it anywhere. Pass it different values each time.",
        dialogue: [
          { character: "Functon", text: "A function is a named spell. You define it once: what it's called, what it needs (parameters), and what it does. Then you call its name whenever you need it." },
          { character: "You", text: "And I can give it different inputs each time?" },
          { character: "Functon", text: "Exactly. function greet(name) { return 'Hello ' + name; } — call greet('Aria'), get 'Hello Aria'. Call greet('Leo'), get 'Hello Leo'. One spell. Infinite uses." }
        ],
        outro: "The Spellcasters begin encoding all city procedures into functions. Healing, trading, building — all reusable now. The city's efficiency doubles overnight."
      },
      technicalContent: {
        explanation: "Functions are reusable blocks of code. They take inputs (parameters), do something, and optionally return an output.",
        keyPoints: [
          "function name(param1, param2) { } defines a function",
          "Call it with name(value1, value2)",
          "return sends a value back to whoever called the function",
          "Arrow functions: const name = (params) => { }",
          "Functions without return give back undefined"
        ],
        examples: [
          { code: "function greet(name) {\n  return 'Hello, ' + name + '!';\n}\nconsole.log(greet('Aria')); // Hello, Aria!", explanation: "Basic function with parameter and return" },
          { code: "const addXP = (current, earned) => {\n  return current + earned;\n}\nconsole.log(addXP(100, 50)); // 150", explanation: "Arrow function" }
        ],
        summary: "Functions are the most powerful tool in programming. Define once, use many times. Always think: 'Can I make this a function?'"
      },
    },
  })

  console.log('✅ Chapter 4 created')

  // ── CHAPTER 5: OBJECTS ────────────────────────────────────────────
  await prisma.chapter.upsert({
    where: { id: 'ch-js-1-5' },
    update: {},
    create: {
      id: 'ch-js-1-5',
      seasonId: season1.id,
      title: 'Chapter 5: The Shape Shifters',
      conceptTaught: 'Objects & Arrays',
      orderIndex: 4,
      xpReward: 180,
      isFree: false,
      storyContent: {
        intro: "The final district of the city is occupied by the Shape Shifters — beings of infinite complexity who cannot be described by a single variable. A name alone is not enough. They have professions, ages, powers, and histories.",
        scene: "Their elder, Objecto, blocks the path. 'You have learned to store single values,' he says. 'But the world is not made of single values. People are collections. Events are collections. Everything complex is a collection of properties.'",
        mission: "Learn objects and arrays — the way to store and organize complex, multi-property data.",
        dialogue: [
          { character: "Objecto", text: "An object is like a citizen's profile card: { name: 'Aria', age: 25, level: 7 }. One thing. Many properties. Accessed with a dot." },
          { character: "You", text: "And arrays?" },
          { character: "Objecto", text: "Arrays are lists. ['Aria', 'Leo', 'Zara'] — a list of names. [10, 20, 30] — a list of numbers. Perfect for collections of similar things." }
        ],
        outro: "You encode the Shape Shifters as objects. Each one has a name, a role, a level. The city's registry is complete. Season 1 is restored."
      },
      technicalContent: {
        explanation: "Objects store multiple related values as key-value pairs. Arrays store ordered lists of values.",
        keyPoints: [
          "Object: { key: value, key2: value2 }",
          "Access properties: object.key or object['key']",
          "Array: [item1, item2, item3]",
          "Array index starts at 0: arr[0] is the first item",
          "arr.length gives the number of items",
          "arr.push(item) adds to end. arr.pop() removes from end"
        ],
        examples: [
          { code: "const citizen = {\n  name: 'Aria',\n  level: 7,\n  isAwake: true\n};\nconsole.log(citizen.name);  // Aria\nconsole.log(citizen.level); // 7", explanation: "Object creation and access" },
          { code: "const guild = ['Aria', 'Leo', 'Zara'];\nconsole.log(guild[0]);      // Aria\nconsole.log(guild.length);  // 3\nguild.push('Max');\nconsole.log(guild.length);  // 4", explanation: "Array creation and manipulation" }
        ],
        summary: "Objects describe things with multiple properties. Arrays store ordered collections. Together, they let you model any real-world concept in code."
      },
    },
  })

  console.log('✅ Chapter 5 created')

  // ── ACHIEVEMENTS ──────────────────────────────────────────────────
  await prisma.achievement.upsert({
    where: { name: 'First Memory' },
    update: {},
    create: {
      name: 'First Memory',
      description: 'Complete your first chapter',
      xpReward: 50,
      condition: { type: 'chapters_completed', count: 1 },
    },
  })

  await prisma.achievement.upsert({
    where: { name: 'Logic Apprentice' },
    update: {},
    create: {
      name: 'Logic Apprentice',
      description: 'Complete all 5 chapters of JavaScript Season 1',
      xpReward: 200,
      condition: { type: 'season_completed', seasonId: 'season-js-1' },
    },
  })

  await prisma.achievement.upsert({
    where: { name: 'Boss Slayer' },
    update: {},
    create: {
      name: 'Boss Slayer',
      description: 'Defeat your first boss challenge',
      xpReward: 100,
      condition: { type: 'boss_defeated', count: 1 },
    },
  })

  await prisma.achievement.upsert({
    where: { name: '7-Day Streak' },
    update: {},
    create: {
      name: '7-Day Streak',
      description: 'Log in 7 days in a row',
      xpReward: 150,
      condition: { type: 'streak', days: 7 },
    },
  })

  console.log('✅ Achievements created')
  console.log('\n🎉 Lexoria database seeded successfully!')
  console.log('   6 subjects | 1 season | 5 chapters | challenges | 4 achievements')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })