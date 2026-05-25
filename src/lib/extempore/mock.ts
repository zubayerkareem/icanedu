export const EXTEMPORE_COURSE_ID = "issb1";
export const EXTEMPORE_TIMER_SECONDS = 25 * 60; // 25 minutes

export interface ExtemporeEssayTopic {
  id: string;
  topic: string;
  category: "current_affairs" | "abstract" | "social" | "ethics" | "quote";
  categoryLabel: string;
  hint: string;          // brief thinking prompt shown during test
  modelPoints: string[]; // key points shown in results
  modelEssay: string;    // full model essay shown in results
}

export interface ExtemporeSet {
  id: string;
  title: string;
  isPremium: boolean;
  topics: ExtemporeEssayTopic[];
}

const TOPICS_SET_01: ExtemporeEssayTopic[] = [
  {
    id: "e1t1",
    topic: "Discipline is the Bridge Between Goals and Achievement",
    category: "abstract",
    categoryLabel: "বিমূর্ত বিষয়",
    hint: "Think: what is discipline, why is it essential for an officer, examples from military/personal life.",
    modelPoints: [
      "Define discipline — self-regulation, adherence to rules, consistency",
      "Discipline in military context: chain of command, punctuality, uniform standards",
      "Personal discipline: study habits, fitness, time management",
      "Historical examples: disciplined armies vs undisciplined forces",
      "Discipline as the foundation of leadership",
      "Conclusion: without discipline, talent alone cannot deliver results",
    ],
    modelEssay: `Discipline is the cornerstone upon which all great achievements are built. It is not a restriction on freedom, but rather the structured framework that transforms ambition into reality. Without discipline, even the most talented individual falls short of their potential.

In the military context, discipline is not merely a virtue — it is a necessity. An army without discipline is a mob. Every regulation, every drill, every order followed without question exists for a reason: to create a cohesive unit that can perform under the most extreme pressure. The great armies of history — from the Roman legions to the modern special forces — derived their power not from individual heroism alone, but from collective, disciplined action.

At the personal level, discipline manifests in the daily choices we make. Waking early, maintaining physical fitness, dedicating time to study and self-improvement — none of these are glamorous acts, yet their cumulative effect is transformational. An officer who cannot discipline himself cannot discipline his men.

The relationship between goals and achievement is rarely a straight line. It is paved with setbacks, distractions, and moments of doubt. Discipline is the bridge that carries us across these gaps. It keeps us on course when motivation fades and circumstances turn unfavourable.

In conclusion, discipline is not the enemy of creativity or freedom — it is their guardian. It channels energy, sharpens focus, and ensures that our efforts compound over time into lasting achievement. A disciplined mind and body is the most reliable weapon any officer can carry.`,
  },
  {
    id: "e1t2",
    topic: "Role of Youth in National Development",
    category: "social",
    categoryLabel: "সামাজিক বিষয়",
    hint: "Consider: youth demographics in Bangladesh, key sectors — education, technology, military, entrepreneurship.",
    modelPoints: [
      "Bangladesh's youth as the demographic dividend",
      "Education and skill development as prerequisites",
      "Military service: youth protecting national sovereignty",
      "Technology and entrepreneurship: driving economic growth",
      "Social responsibility: combating extremism, promoting unity",
      "Challenges: unemployment, brain drain",
      "Conclusion: youth as the architects of tomorrow",
    ],
    modelEssay: `A nation's greatest asset is its young generation. In Bangladesh, where nearly one-third of the population is between the ages of 15 and 29, the role of youth in national development is not merely important — it is decisive.

History bears witness that nations have risen or fallen on the strength of their youth. The Liberation War of 1971 was fuelled by the courage and conviction of young Bangladeshis who chose sacrifice over submission. Today, while the nature of the battlefield has changed, the call to serve the nation remains equally urgent.

In the realm of economic development, the youth of Bangladesh are emerging as entrepreneurs, technologists, and innovators. The garment industry, the backbone of the national economy, is sustained by millions of young workers. The growing IT sector, the thriving startup ecosystem, and the expanding digital economy are all products of youthful energy and creativity.

In the military and civil services, young men and women commit their lives to the protection and administration of the state. The Bangladesh Army, Navy, and Air Force draw their strength from patriots who choose duty over comfort. This spirit of service must be cultivated and honoured.

However, the potential of youth is not automatic — it requires investment. Quality education, skills training, and equal opportunity must be ensured. Unemployment and disillusionment are fertile ground for extremism, and society must address these risks proactively.

In conclusion, the youth are not merely the future — they are the present. Their energy, idealism, and capacity for sacrifice make them the true architects of national development. Bangladesh's destiny lies in their hands.`,
  },
  {
    id: "e1t3",
    topic: "Leadership vs Management: What Does the Armed Forces Need?",
    category: "abstract",
    categoryLabel: "বিমূর্ত বিষয়",
    hint: "Contrast leadership (inspiring people) with management (organizing tasks). Which matters more for officers?",
    modelPoints: [
      "Define leadership: inspiring, influencing, vision-setting",
      "Define management: planning, organizing, controlling resources",
      "In peacetime: management skills keep operations running",
      "In combat/crisis: leadership is critical — decisions under uncertainty",
      "An officer needs both, but leadership is the higher calling",
      "Examples: great military leaders vs administrators",
      "Conclusion: armed forces need leader-managers, but character over process",
    ],
    modelEssay: `The distinction between leadership and management is one of the most discussed topics in organizational theory, yet nowhere is it more consequential than in the armed forces, where the stakes are human lives and national security.

Management, at its core, is the science of getting things done through planning, organizing, and controlling resources. It is systematic, process-driven, and essential for the smooth functioning of any institution. A well-managed unit maintains its equipment, meets its logistical requirements, and operates within established procedures.

Leadership, by contrast, is the art of inspiring people to go beyond what is required — to act with courage, initiative, and commitment even when the rules provide no guidance. Leadership is what compels soldiers to advance under fire, to sacrifice personal safety for a comrade, to hold a position against overwhelming odds because their officer stands beside them and says, "We will not yield."

The armed forces need both. In garrison, during peace, management skills ensure efficiency, discipline, and preparedness. Logistics, training schedules, equipment maintenance — these are the domain of the capable manager. But in the field, when the plan disintegrates upon contact with the enemy, what a unit needs is a leader.

History's greatest military commanders — Alexander, Patton, Osmany — were not distinguished by their administrative competence alone. They were distinguished by their character: their ability to communicate a vision, to inspire loyalty, and to make decisions in the fog of uncertainty.

In conclusion, the armed forces require officer-leaders who can manage when conditions are stable and lead when they are not. But when forced to choose, character over process, inspiration over administration — that is the soul of military leadership.`,
  },
];

const TOPICS_SET_02: ExtemporeEssayTopic[] = [
  {
    id: "e2t1",
    topic: "Social Media: A Blessing or a Curse?",
    category: "social",
    categoryLabel: "সামাজিক বিষয়",
    hint: "Balance both sides: communication, awareness vs misinformation, addiction, national security threats.",
    modelPoints: [
      "Social media's reach: billions connected globally",
      "Benefits: information sharing, social movements, business growth",
      "Dangers: misinformation, radicalization, privacy violations",
      "Military/security perspective: OPSEC threats, propaganda",
      "Responsibility of users, platforms, and government",
      "Conclusion: tool whose impact depends on the user's wisdom",
    ],
    modelEssay: `Social media is arguably the most transformative communication technology since the printing press. With billions of users worldwide and near-instant global reach, it has fundamentally altered how societies share information, form opinions, and organize collective action. Whether this transformation constitutes a blessing or a curse depends entirely on how we choose to use it.

The benefits of social media are undeniable. It has democratized information, giving voice to the voiceless and enabling citizens to hold institutions accountable. Movements for justice, disaster relief coordination, and public health awareness campaigns have all been amplified by social media platforms. For businesses and entrepreneurs, it has opened markets and reduced barriers to entry.

Yet the same tools that empower can also corrupt. The spread of misinformation at unprecedented speed has destabilized democracies, incited violence, and eroded public trust in legitimate institutions. The algorithms that govern these platforms are optimized for engagement, not truth — and engagement is often driven by outrage and fear.

From a national security perspective, social media poses distinct threats. Classified information leaked by careless servicemen, foreign propaganda operations targeting soldiers' families, and the radicalization of vulnerable youth are real and documented risks. An officer must be acutely aware of what they share and what their personnel share.

In conclusion, social media is a tool, and like all tools, its impact is determined by the wisdom of its users. It is a blessing when it informs, connects, and empowers. It is a curse when it manipulates, divides, and deceives. Our responsibility is to use it with critical thinking and moral clarity.`,
  },
  {
    id: "e2t2",
    topic: "Ethics in Uniform: Why Moral Character Matters More Than Rank",
    category: "ethics",
    categoryLabel: "নৈতিকতা",
    hint: "Think about integrity, the trust soldiers place in officers, historical moral failures of commanders.",
    modelPoints: [
      "Rank as authority; character as legitimacy",
      "Soldiers follow leaders, not just ranks",
      "Ethical failures: their consequences on morale and mission",
      "Integrity under pressure — the hardest test",
      "The relationship between ethics and effectiveness",
      "Armed forces as moral institutions beyond combat",
      "Conclusion: uniform gives authority, character earns respect",
    ],
    modelEssay: `A uniform confers rank. Rank confers authority. But authority without moral character is a burden — to the officer who wields it, and to every soldier who must obey it.

In the military profession, the ethical dimension of leadership is not a philosophical abstraction. It has direct, practical consequences. Soldiers will follow an order from a senior officer, but they will run through fire for a leader they trust. That trust is not earned by the stars on a shoulder — it is earned by consistency between words and actions, by fairness, by honesty even when honesty is costly.

History offers sobering lessons in the consequences of moral failure in uniform. Commanders who ordered atrocities, who betrayed their men for personal advancement, or who concealed critical information to preserve their careers — these figures are remembered not for their rank but for their corruption. Their failures do not merely shame themselves; they damage the institution they serve.

Conversely, the officers most celebrated in military history — regardless of culture or era — are remembered for their character: their courage to refuse unjust orders, their willingness to share their soldiers' hardships, their incorruptibility in the face of temptation.

Ethics in uniform matters also at the institutional level. Armed forces that maintain high ethical standards earn the respect of the population they protect. They are trusted with power precisely because that power is expected to be exercised with restraint and integrity.

In conclusion, rank is given; respect is earned. The uniform represents a nation's trust in its military. An officer must be worthy of that trust — not only by competence, but by character. For in the end, moral authority outlasts every medal and every promotion.`,
  },
  {
    id: "e2t3",
    topic: "Climate Change and National Security",
    category: "current_affairs",
    categoryLabel: "সমসাময়িক বিষয়",
    hint: "Bangladesh is highly vulnerable. Connect: floods, displacement, resource conflict, military preparedness.",
    modelPoints: [
      "Bangladesh's vulnerability: low elevation, cyclones, flooding",
      "Climate as a 'threat multiplier' for existing conflicts",
      "Resource wars: water, food scarcity driven by climate",
      "Climate migration: internal displacement and border pressure",
      "Military's role in disaster relief (already a major function in BD)",
      "International cooperation: Paris Agreement, regional security",
      "Conclusion: climate security is national security",
    ],
    modelEssay: `Climate change is no longer a distant threat discussed only in academic journals and international summits. For Bangladesh, it is an immediate and existential challenge — one with profound implications for national security.

Bangladesh's geography makes it uniquely vulnerable. One-third of the country lies within three metres of sea level. Annual flooding already displaces millions; cyclones of increasing intensity batter the coastline. As global temperatures rise, these threats will intensify. The Intergovernmental Panel on Climate Change projects that by 2050, significant portions of Bangladesh's coast could be permanently inundated, potentially displacing tens of millions of people.

The security implications of this are severe. Mass displacement creates instability. Desperate populations are more susceptible to radicalization and conflict. Competition over diminishing agricultural land and freshwater resources can ignite violence. Climate change is, as security analysts have recognized, a "threat multiplier" — it does not create conflicts from nothing, but it exacerbates every existing tension.

The Bangladesh Armed Forces are already deeply involved in climate-related operations. Disaster relief, flood management, and emergency response form a significant portion of the military's domestic operations. This role will only grow as climate events become more frequent and severe. An officer commission today must prepare for a future where the enemy is often not a human adversary but a rising tide.

The response requires both domestic adaptation — investing in flood defences, early warning systems, and climate-resilient infrastructure — and international cooperation. Bangladesh cannot solve this alone; it requires global commitments and regional security architectures that account for climate.

In conclusion, to defend Bangladesh is to defend its land, its coast, and its climate future. Climate security and national security are inseparable.`,
  },
];

export const EXTEMPORE_SETS: ExtemporeSet[] = [
  { id: "ext-01", title: "Set 01 — Abstract & Leadership",   isPremium: false, topics: TOPICS_SET_01 },
  { id: "ext-02", title: "Set 02 — Social & Current Affairs", isPremium: false, topics: TOPICS_SET_02 },
];
