export const IST_COURSE_ID = "issb1";

export interface ISTSentence {
  id: string;
  stem: string;         // incomplete part shown to student
  example: string;      // full ideal answer shown in results
}

export interface ISTSet {
  id: string;
  title: string;
  isPremium: boolean;
  timerSeconds: number;
  sentences: ISTSentence[];
}

const NEGATIVE_MODEL_01: ISTSentence[] = [
  { id: "n1s1",  stem: "রেগে গেলে",              example: "রেগে গেলে আমি নিজেকে শান্ত রাখার চেষ্টা করি" },
  { id: "n1s2",  stem: "আমার হিংসা হয়",          example: "আমার হিংসা হয় না, বরং অনুপ্রেরণা নিই" },
  { id: "n1s3",  stem: "সমালোচনা",               example: "সমালোচনা আমাকে আরও ভালো করে তোলে" },
  { id: "n1s4",  stem: "কেউ উপহাস করলে",         example: "কেউ উপহাস করলে আমি আত্মবিশ্বাস হারাই না" },
  { id: "n1s5",  stem: "রাগান্বিত হই না",         example: "রাগান্বিত হই না কারণ আমি পরিস্থিতি বিশ্লেষণ করি" },
  { id: "n1s6",  stem: "আমি রাগান্বিত হই যখন",   example: "আমি রাগান্বিত হই যখন অবিচার দেখি" },
  { id: "n1s7",  stem: "উত্তেজিত হলে",            example: "উত্তেজিত হলে গভীর শ্বাস নিয়ে শান্ত হই" },
  { id: "n1s8",  stem: "হঠাৎ ক্ষেপে গেলে",       example: "হঠাৎ ক্ষেপে গেলে পরিণতি ভেবে নিজেকে সামলাই" },
  { id: "n1s9",  stem: "আমি রাগান্বিত",           example: "আমি রাগান্বিত হলে চুপ থেকে সমস্যা সমাধান করি" },
  { id: "n1s10", stem: "সমালোচনাকে আমি",         example: "সমালোচনাকে আমি উন্নতির সুযোগ মনে করি" },
  { id: "n1s11", stem: "অন্যায় দেখলে",            example: "অন্যায় দেখলে প্রতিবাদ করি" },
  { id: "n1s12", stem: "অহংকার",                  example: "অহংকার পতনের মূল কারণ" },
  { id: "n1s13", stem: "পছন্দ করি না",            example: "পছন্দ করি না অন্যের নিন্দা করতে" },
  { id: "n1s14", stem: "কাউকে রাগান্বিত হলে দেখলে", example: "কাউকে রাগান্বিত হলে দেখলে তাকে শান্ত করার চেষ্টা করি" },
  { id: "n1s15", stem: "নিজের সমালোচনা শুনলে",   example: "নিজের সমালোচনা শুনলে নিজেকে পরিবর্তনের সুযোগ খুঁজি" },
  { id: "n1s16", stem: "আম্মার বকুনি খেয়ে",      example: "আম্মার বকুনি খেয়ে নিজের ভুল বুঝতে পারি" },
  { id: "n1s17", stem: "রাগান্বিত হলে",           example: "রাগান্বিত হলে একা কিছুক্ষণ থেকে মাথা ঠান্ডা করি" },
  { id: "n1s18", stem: "আমার দুঃখ",              example: "আমার দুঃখ থেকে আমি শক্তি সংগ্রহ করি" },
  { id: "n1s19", stem: "বেশি খারাপ লাগলে",        example: "বেশি খারাপ লাগলে পরিবারের সাথে কথা বলি" },
  { id: "n1s20", stem: "আমি অসুখী হই",           example: "আমি অসুখী হই না কারণ জীবনকে ইতিবাচকভাবে দেখি" },
  { id: "n1s21", stem: "আমি হতাশায় ভুগি",        example: "আমি হতাশায় ভুগি না, বাধা অতিক্রম করে এগিয়ে যাই" },
  { id: "n1s22", stem: "আমি মর্মাহত হই",         example: "আমি মর্মাহত হই কিন্তু ভেঙে পড়ি না" },
  { id: "n1s23", stem: "দুঃখ পেলে",              example: "দুঃখ পেলে নতুন উদ্যমে কাজে লেগে পড়ি" },
  { id: "n1s24", stem: "ভারাক্রান্ত মনে আমি",     example: "ভারাক্রান্ত মনে আমি লক্ষ্যের কথা মনে করি" },
  { id: "n1s25", stem: "ব্যর্থ হলে",             example: "ব্যর্থ হলে কারণ বিশ্লেষণ করে আবার চেষ্টা করি" },
];

const MODEL_01: ISTSentence[] = [
  { id: "m1s1",  stem: "আমার লক্ষ্য",            example: "আমার লক্ষ্য দেশের সেবায় সেনাবাহিনীতে যোগ দেওয়া" },
  { id: "m1s2",  stem: "ভবিষ্যতে আমি",           example: "ভবিষ্যতে আমি একজন দক্ষ অফিসার হতে চাই" },
  { id: "m1s3",  stem: "আমার পরিবার",            example: "আমার পরিবার আমার সবচেয়ে বড় অনুপ্রেরণা" },
  { id: "m1s4",  stem: "বন্ধুত্ব মানে",          example: "বন্ধুত্ব মানে বিশ্বাস, সম্মান এবং পারস্পরিক সহযোগিতা" },
  { id: "m1s5",  stem: "নেতৃত্ব দেওয়া",          example: "নেতৃত্ব দেওয়া মানে দায়িত্ব নেওয়া ও অন্যকে পথ দেখানো" },
  { id: "m1s6",  stem: "কঠিন পরিস্থিতিতে আমি",  example: "কঠিন পরিস্থিতিতে আমি শান্ত থেকে সঠিক সিদ্ধান্ত নিই" },
  { id: "m1s7",  stem: "দেশের জন্য",             example: "দেশের জন্য যেকোনো ত্যাগ স্বীকার করতে প্রস্তুত" },
  { id: "m1s8",  stem: "সফলতা আসে",             example: "সফলতা আসে অক্লান্ত পরিশ্রম ও একাগ্রতা থেকে" },
  { id: "m1s9",  stem: "আমি বিশ্বাস করি",        example: "আমি বিশ্বাস করি সততাই সর্বোত্তম পথ" },
  { id: "m1s10", stem: "শৃঙ্খলা",               example: "শৃঙ্খলা ছাড়া কোনো সংগঠন সাফল্য পেতে পারে না" },
  { id: "m1s11", stem: "দলগত কাজে",             example: "দলগত কাজে আমি সবার মতামতকে গুরুত্ব দিই" },
  { id: "m1s12", stem: "চাপে পড়লে",             example: "চাপে পড়লে আমি আরও মনোযোগী হয়ে উঠি" },
  { id: "m1s13", stem: "আমার শক্তি",             example: "আমার শক্তি হলো অদম্য মনোবল ও পরিশ্রমী মনোভাব" },
  { id: "m1s14", stem: "ভুল করলে",              example: "ভুল করলে স্বীকার করি এবং সংশোধন করি" },
  { id: "m1s15", stem: "সহকর্মীদের সাথে",        example: "সহকর্মীদের সাথে সম্মান ও সহযোগিতার সম্পর্ক রাখি" },
  { id: "m1s16", stem: "প্রতিযোগিতায়",           example: "প্রতিযোগিতায় আমি সেরাটা দেওয়ার চেষ্টা করি" },
  { id: "m1s17", stem: "জীবনে সবচেয়ে গুরুত্বপূর্ণ", example: "জীবনে সবচেয়ে গুরুত্বপূর্ণ হলো সততা ও দায়িত্ববোধ" },
  { id: "m1s18", stem: "আমার দুর্বলতা",          example: "আমার দুর্বলতা জেনে তা কাটিয়ে উঠতে কাজ করি" },
  { id: "m1s19", stem: "নতুন চ্যালেঞ্জ",          example: "নতুন চ্যালেঞ্জ আমাকে উৎসাহিত করে" },
  { id: "m1s20", stem: "সময় নষ্ট করা",           example: "সময় নষ্ট করা আমার স্বভাবে নেই" },
  { id: "m1s21", stem: "কর্তব্য পালনে",           example: "কর্তব্য পালনে আমি কোনো আপোষ করি না" },
  { id: "m1s22", stem: "আমার স্বপ্ন",             example: "আমার স্বপ্ন দেশের সেবায় নিজেকে উৎসর্গ করা" },
  { id: "m1s23", stem: "বাধা পেলে",              example: "বাধা পেলে আমি আরও দৃঢ়ভাবে এগিয়ে যাই" },
  { id: "m1s24", stem: "সমস্যা দেখলে",           example: "সমস্যা দেখলে এড়িয়ে না গিয়ে সমাধান খুঁজি" },
  { id: "m1s25", stem: "আমার অর্জন",             example: "আমার অর্জন আমাকে আরও বড় লক্ষ্যে অনুপ্রাণিত করে" },
];

export const IST_SETS: ISTSet[] = [
  { id: "neg-01", title: "All Negative Model 01", isPremium: false, timerSeconds: 300, sentences: NEGATIVE_MODEL_01 },
  { id: "neg-02", title: "All Negative Model 02", isPremium: false, timerSeconds: 300, sentences: [...NEGATIVE_MODEL_01].reverse() },
  { id: "neg-03", title: "All Negative Model 03", isPremium: true,  timerSeconds: 300, sentences: NEGATIVE_MODEL_01.map((s, i) => ({ ...s, id: `n3s${i}` })) },
  { id: "neg-04", title: "All Negative Model 04", isPremium: true,  timerSeconds: 300, sentences: [...NEGATIVE_MODEL_01].sort(() => 0.5 - Math.random()).map((s, i) => ({ ...s, id: `n4s${i}` })) },
  { id: "mod-01", title: "Model Test 01",          isPremium: true,  timerSeconds: 300, sentences: MODEL_01 },
  { id: "mod-02", title: "Model Test 02",          isPremium: true,  timerSeconds: 300, sentences: [...MODEL_01].reverse() },
  { id: "mod-03", title: "Model Test 03",          isPremium: true,  timerSeconds: 300, sentences: MODEL_01.map((s, i) => ({ ...s, id: `m3s${i}` })) },
  { id: "mod-04", title: "Model Test 04",          isPremium: true,  timerSeconds: 300, sentences: [...MODEL_01].slice(5).map((s, i) => ({ ...s, id: `m4s${i}` })) },
  { id: "mod-05", title: "Model Test 05",          isPremium: true,  timerSeconds: 300, sentences: [...MODEL_01].slice(0, 20).map((s, i) => ({ ...s, id: `m5s${i}` })) },
];
