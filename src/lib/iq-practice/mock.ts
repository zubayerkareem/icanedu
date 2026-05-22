export interface IQOption {
  id: string;
  text: string;
}

export interface IQQuestion {
  id: string;
  text: string;
  hasImage?: boolean;
  options: IQOption[];
  correct: string;
}

export interface IQSet {
  id: string;
  title: string;
  description: string;
  timerSeconds: number;
  questions: IQQuestion[];
}

export const IQ_COURSE_ID = "issb1";

export const IQ_SETS: IQSet[] = [
  {
    id: "set1",
    title: "সেট ১ — সংখ্যা ধারা",
    description: "সংখ্যার নিয়ম বিশ্লেষণ করে সঠিক উত্তর নির্বাচন করুন।",
    timerSeconds: 300,
    questions: [
      {
        id: "s1q1",
        text: "২, ৪, ৬, ৮, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "৯" }, { id: "b", text: "১০" }, { id: "c", text: "১১" }, { id: "d", text: "১২" }],
        correct: "b",
      },
      {
        id: "s1q2",
        text: "১, ১, ২, ৩, ৫, ৮, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "১১" }, { id: "b", text: "১২" }, { id: "c", text: "১৩" }, { id: "d", text: "১৪" }],
        correct: "c",
      },
      {
        id: "s1q3",
        text: "৫, ১০, ২০, ৪০, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "৬০" }, { id: "b", text: "৭০" }, { id: "c", text: "৮০" }, { id: "d", text: "৯০" }],
        correct: "c",
      },
      {
        id: "s1q4",
        text: "১০০, ৯০, ৮১, ৭৩, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "৬৫" }, { id: "b", text: "৬৬" }, { id: "c", text: "৬৪" }, { id: "d", text: "৬৭" }],
        correct: "b",
      },
      {
        id: "s1q5",
        text: "৩, ৯, ২৭, ৮১, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "২১৬" }, { id: "b", text: "২৪৩" }, { id: "c", text: "১৬২" }, { id: "d", text: "৩২৪" }],
        correct: "b",
      },
      {
        id: "s1q6",
        text: "২, ৬, ১২, ২০, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "২৮" }, { id: "b", text: "৩০" }, { id: "c", text: "৩২" }, { id: "d", text: "৩৬" }],
        correct: "b",
      },
      {
        id: "s1q7",
        text: "১৬, ৮, ৪, ২, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "০.৫" }, { id: "b", text: "১" }, { id: "c", text: "১.৫" }, { id: "d", text: "০" }],
        correct: "b",
      },
      {
        id: "s1q8",
        text: "১, ৪, ৯, ১৬, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "২০" }, { id: "b", text: "২৩" }, { id: "c", text: "২৫" }, { id: "d", text: "৩০" }],
        correct: "c",
      },
      {
        id: "s1q9",
        text: "৭, ১৪, ২১, ২৮, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "৩২" }, { id: "b", text: "৩৫" }, { id: "c", text: "৩৬" }, { id: "d", text: "৪০" }],
        correct: "b",
      },
      {
        id: "s1q10",
        text: "০, ১, ৩, ৬, ১০, __ — পরবর্তী সংখ্যাটি কত?",
        options: [{ id: "a", text: "১৩" }, { id: "b", text: "১৪" }, { id: "c", text: "১৫" }, { id: "d", text: "১৬" }],
        correct: "c",
      },
    ],
  },
  {
    id: "set2",
    title: "সেট ২ — যুক্তিমূলক বিশ্লেষণ",
    description: "যুক্তি ও বিশ্লেষণমূলক প্রশ্নের সঠিক উত্তর নির্বাচন করুন।",
    timerSeconds: 300,
    questions: [
      {
        id: "s2q1",
        text: "যদি সব বিড়াল স্তন্যপায়ী হয় এবং কিছু স্তন্যপায়ী জলজ হয়, তাহলে নিচের কোন সিদ্ধান্তটি সঠিক?",
        options: [
          { id: "a", text: "সব বিড়াল জলজ" },
          { id: "b", text: "কিছু বিড়াল জলজ হতে পারে" },
          { id: "c", text: "কোন বিড়াল জলজ না" },
          { id: "d", text: "সব স্তন্যপায়ী বিড়াল" },
        ],
        correct: "b",
      },
      {
        id: "s2q2",
        text: "রহিম, করিম থেকে লম্বা। করিম, জামাল থেকে খাটো। জামাল সবচেয়ে লম্বা হলে, নিচের কোনটি সঠিক?",
        options: [
          { id: "a", text: "রহিম সবচেয়ে খাটো" },
          { id: "b", text: "করিম সবচেয়ে লম্বা" },
          { id: "c", text: "রহিম করিম থেকে লম্বা কিন্তু জামালের চেয়ে খাটো" },
          { id: "d", text: "করিম ও রহিম সমান" },
        ],
        correct: "c",
      },
      {
        id: "s2q3",
        text: "একটি ঘড়িতে ৩টা বাজলে ঘণ্টার কাঁটা ও মিনিটের কাঁটার মধ্যে কোণ কত ডিগ্রি?",
        options: [{ id: "a", text: "৬০°" }, { id: "b", text: "৯০°" }, { id: "c", text: "১২০°" }, { id: "d", text: "১৮০°" }],
        correct: "b",
      },
      {
        id: "s2q4",
        text: "বিজোড়টি কোনটি? ২, ৪, ৬, ৯, ১০",
        options: [{ id: "a", text: "২" }, { id: "b", text: "৪" }, { id: "c", text: "৯" }, { id: "d", text: "১০" }],
        correct: "c",
      },
      {
        id: "s2q5",
        text: "একটি ট্রেন ৬০ কিমি/ঘণ্টায় চললে ৩ ঘণ্টায় কত কিমি যাবে?",
        options: [{ id: "a", text: "১৬০ কিমি" }, { id: "b", text: "১৮০ কিমি" }, { id: "c", text: "২০০ কিমি" }, { id: "d", text: "২২০ কিমি" }],
        correct: "b",
      },
      {
        id: "s2q6",
        text: "নিচের কোনটি ছবির সাথে সম্পর্কিত নিয়মটি মেনে চলে?",
        hasImage: true,
        options: [{ id: "a", text: "ত্রিভুজ" }, { id: "b", text: "বৃত্ত" }, { id: "c", text: "বর্গ" }, { id: "d", text: "আয়তক্ষেত্র" }],
        correct: "c",
      },
      {
        id: "s2q7",
        text: "A = ১, B = ২, C = ৩ হলে CAB = কত?",
        options: [{ id: "a", text: "৩১২" }, { id: "b", text: "১২৩" }, { id: "c", text: "২১৩" }, { id: "d", text: "৩২১" }],
        correct: "a",
      },
      {
        id: "s2q8",
        text: "যদি ARMY = ১২৩৪ হয়, তাহলে MARY = ?",
        options: [{ id: "a", text: "২৩১৪" }, { id: "b", text: "৩১২৪" }, { id: "c", text: "৪১২৩" }, { id: "d", text: "২১৩৪" }],
        correct: "b",
      },
      {
        id: "s2q9",
        text: "বিজোড়টি কোনটি? কুকুর, বিড়াল, সিংহ, মাছ, বাঘ",
        options: [{ id: "a", text: "কুকুর" }, { id: "b", text: "বিড়াল" }, { id: "c", text: "মাছ" }, { id: "d", text: "বাঘ" }],
        correct: "c",
      },
      {
        id: "s2q10",
        text: "একটি বর্গের একটি বাহু ৫ সেমি হলে তার ক্ষেত্রফল কত?",
        options: [{ id: "a", text: "১০ বর্গ সেমি" }, { id: "b", text: "২০ বর্গ সেমি" }, { id: "c", text: "২৫ বর্গ সেমি" }, { id: "d", text: "৩০ বর্গ সেমি" }],
        correct: "c",
      },
      {
        id: "s2q11",
        text: "যদি আজ সোমবার হয়, তাহলে ৫০ দিন পর কোন বার হবে?",
        options: [{ id: "a", text: "সোমবার" }, { id: "b", text: "মঙ্গলবার" }, { id: "c", text: "বুধবার" }, { id: "d", text: "বৃহস্পতিবার" }],
        correct: "c",
      },
      {
        id: "s2q12",
        text: "ছবিতে প্যাটার্নটির পরবর্তী আকৃতি কোনটি?",
        hasImage: true,
        options: [{ id: "a", text: "১টি বৃত্ত" }, { id: "b", text: "২টি বৃত্ত" }, { id: "c", text: "৩টি বৃত্ত" }, { id: "d", text: "৪টি বৃত্ত" }],
        correct: "d",
      },
    ],
  },
  {
    id: "set3",
    title: "সেট ৩ — সাদৃশ্য ও সম্পর্ক",
    description: "শব্দ ও ধারণার সম্পর্ক বিশ্লেষণ করুন।",
    timerSeconds: 300,
    questions: [
      {
        id: "s3q1",
        text: "চিকিৎসক : হাসপাতাল :: শিক্ষক : ?",
        options: [{ id: "a", text: "বিদ্যালয়" }, { id: "b", text: "বাজার" }, { id: "c", text: "আদালত" }, { id: "d", text: "দোকান" }],
        correct: "a",
      },
      {
        id: "s3q2",
        text: "কলম : লেখা :: ছুরি : ?",
        options: [{ id: "a", text: "রান্না" }, { id: "b", text: "কাটা" }, { id: "c", text: "মারা" }, { id: "d", text: "আঁকা" }],
        correct: "b",
      },
      {
        id: "s3q3",
        text: "মাছ : সাঁতার :: পাখি : ?",
        options: [{ id: "a", text: "দৌড়ানো" }, { id: "b", text: "হাঁটা" }, { id: "c", text: "ওড়া" }, { id: "d", text: "লাফ দেওয়া" }],
        correct: "c",
      },
      {
        id: "s3q4",
        text: "ঢাকা : বাংলাদেশ :: দিল্লি : ?",
        options: [{ id: "a", text: "পাকিস্তান" }, { id: "b", text: "নেপাল" }, { id: "c", text: "ভারত" }, { id: "d", text: "চীন" }],
        correct: "c",
      },
      {
        id: "s3q5",
        text: "বই : পাতা :: গাছ : ?",
        options: [{ id: "a", text: "মাটি" }, { id: "b", text: "পাতা" }, { id: "c", text: "ফুল" }, { id: "d", text: "ফল" }],
        correct: "b",
      },
      {
        id: "s3q6",
        text: "ছবিতে কোনটির সাথে নিচের আকৃতির মিল আছে?",
        hasImage: true,
        options: [{ id: "a", text: "পিরামিড" }, { id: "b", text: "কিউব" }, { id: "c", text: "সিলিন্ডার" }, { id: "d", text: "গোলক" }],
        correct: "b",
      },
      {
        id: "s3q7",
        text: "জল : তরল :: বায়ু : ?",
        options: [{ id: "a", text: "কঠিন" }, { id: "b", text: "তরল" }, { id: "c", text: "গ্যাসীয়" }, { id: "d", text: "প্লাজমা" }],
        correct: "c",
      },
      {
        id: "s3q8",
        text: "সূর্য : দিন :: চাঁদ : ?",
        options: [{ id: "a", text: "আলো" }, { id: "b", text: "রাত" }, { id: "c", text: "গ্রহ" }, { id: "d", text: "নক্ষত্র" }],
        correct: "b",
      },
      {
        id: "s3q9",
        text: "বাংলাদেশ সেনাবাহিনী : স্থলপথ :: বাংলাদেশ নৌবাহিনী : ?",
        options: [{ id: "a", text: "আকাশপথ" }, { id: "b", text: "স্থলপথ" }, { id: "c", text: "জলপথ" }, { id: "d", text: "মহাকাশ" }],
        correct: "c",
      },
      {
        id: "s3q10",
        text: "অফিসার : সৈনিক :: শিক্ষক : ?",
        options: [{ id: "a", text: "প্রধান শিক্ষক" }, { id: "b", text: "ছাত্র" }, { id: "c", text: "অভিভাবক" }, { id: "d", text: "পরিদর্শক" }],
        correct: "b",
      },
      {
        id: "s3q11",
        text: "হাত : আঙুল :: পা : ?",
        options: [{ id: "a", text: "হাঁটু" }, { id: "b", text: "গোড়ালি" }, { id: "c", text: "আঙুল" }, { id: "d", text: "পায়ের পাতা" }],
        correct: "c",
      },
    ],
  },
  {
    id: "set4",
    title: "সেট ৪ — মিশ্র আইকিউ",
    description: "বিভিন্ন ধরনের আইকিউ প্রশ্নের মিশ্র সেট।",
    timerSeconds: 300,
    questions: [
      {
        id: "s4q1",
        text: "একটি আয়তক্ষেত্রের দৈর্ঘ্য ১২ সেমি এবং প্রস্থ ৮ সেমি। পরিধি কত?",
        options: [{ id: "a", text: "৩৬ সেমি" }, { id: "b", text: "৪০ সেমি" }, { id: "c", text: "৪৮ সেমি" }, { id: "d", text: "৯৬ সেমি" }],
        correct: "b",
      },
      {
        id: "s4q2",
        text: "ছবিতে কোন আকৃতিটি বাকিদের থেকে আলাদা?",
        hasImage: true,
        options: [{ id: "a", text: "আকৃতি ক" }, { id: "b", text: "আকৃতি খ" }, { id: "c", text: "আকৃতি গ" }, { id: "d", text: "আকৃতি ঘ" }],
        correct: "c",
      },
      {
        id: "s4q3",
        text: "৩০ জন শিক্ষার্থীর মধ্যে ৬০% পাস করলে কতজন ফেল করেছে?",
        options: [{ id: "a", text: "১০ জন" }, { id: "b", text: "১২ জন" }, { id: "c", text: "১৫ জন" }, { id: "d", text: "১৮ জন" }],
        correct: "b",
      },
      {
        id: "s4q4",
        text: "Z, Y, X, W, __ — পরবর্তী অক্ষরটি কী?",
        options: [{ id: "a", text: "U" }, { id: "b", text: "V" }, { id: "c", text: "T" }, { id: "d", text: "S" }],
        correct: "b",
      },
      {
        id: "s4q5",
        text: "একটি সংখ্যার ৪ গুণের সাথে ৮ যোগ করলে ৪০ হয়। সংখ্যাটি কত?",
        options: [{ id: "a", text: "৬" }, { id: "b", text: "৭" }, { id: "c", text: "৮" }, { id: "d", text: "৯" }],
        correct: "c",
      },
      {
        id: "s4q6",
        text: "যদি একটি কোডে CAT = ৩১২০, তাহলে BAT = ?",
        options: [{ id: "a", text: "২১২০" }, { id: "b", text: "৩২১০" }, { id: "c", text: "১২৩০" }, { id: "d", text: "২১০৩" }],
        correct: "a",
      },
      {
        id: "s4q7",
        text: "পানির রাসায়নিক সংকেত কোনটি?",
        options: [{ id: "a", text: "CO₂" }, { id: "b", text: "H₂O" }, { id: "c", text: "NaCl" }, { id: "d", text: "O₂" }],
        correct: "b",
      },
      {
        id: "s4q8",
        text: "ছবিতে ঘূর্ণায়মান প্যাটার্নের পরবর্তী অবস্থান কোনটি?",
        hasImage: true,
        options: [{ id: "a", text: "অবস্থান ক" }, { id: "b", text: "অবস্থান খ" }, { id: "c", text: "অবস্থান গ" }, { id: "d", text: "অবস্থান ঘ" }],
        correct: "b",
      },
      {
        id: "s4q9",
        text: "বাংলাদেশের স্বাধীনতা দিবস কোন তারিখে?",
        options: [{ id: "a", text: "১৬ ডিসেম্বর" }, { id: "b", text: "২১ ফেব্রুয়ারি" }, { id: "c", text: "২৬ মার্চ" }, { id: "d", text: "১৫ আগস্ট" }],
        correct: "c",
      },
      {
        id: "s4q10",
        text: "৫! (৫ ফ্যাক্টরিয়াল) = ?",
        options: [{ id: "a", text: "১০০" }, { id: "b", text: "৬০" }, { id: "c", text: "১২০" }, { id: "d", text: "২৪" }],
        correct: "c",
      },
      {
        id: "s4q11",
        text: "একটি ত্রিভুজের তিন কোণের সমষ্টি কত ডিগ্রি?",
        options: [{ id: "a", text: "৯০°" }, { id: "b", text: "১৮০°" }, { id: "c", text: "২৭০°" }, { id: "d", text: "৩৬০°" }],
        correct: "b",
      },
      {
        id: "s4q12",
        text: "ছবিতে লুকানো সংখ্যাটি খুঁজে বের করুন।",
        hasImage: true,
        options: [{ id: "a", text: "৭" }, { id: "b", text: "৯" }, { id: "c", text: "১১" }, { id: "d", text: "১৩" }],
        correct: "b",
      },
    ],
  },
];
