export const PPDT_COURSE_ID = "issb1";

export interface PPDTPicture {
  id: string;
  picture_number: number;
  image_url: string;
  title: string;
  description: string;
  idea: string;
}

export interface PPDTSet {
  id: string;
  name: string;
  is_active: boolean;
  pictures: PPDTPicture[];
}

export const PPDT_MOCK_SET: PPDTSet = {
  id: "ppdt-set-1",
  name: "PPDT Practice Set 1",
  is_active: true,
  pictures: [
    {
      id: "ppdt-pic-1",
      picture_number: 1,
      image_url: "https://picsum.photos/seed/ppdt1/900/600",
      title: "সামরিক অভিযান",
      description: "একটি সামরিক দল একটি জটিল পরিস্থিতিতে রয়েছে। দলনেতা তার সদস্যদের নিরাপদে লক্ষ্যে পৌঁছে দেওয়ার জন্য সঠিক সিদ্ধান্ত নিচ্ছেন।",
      idea: "ছবিতে কতজন মানুষ, তারা কী করছে, পরিবেশ কেমন — এই তিনটি দিক খেয়াল করুন এবং একটি সংগতিপূর্ণ গল্প তৈরি করুন।",
    },
    {
      id: "ppdt-pic-2",
      picture_number: 2,
      image_url: "https://picsum.photos/seed/ppdt2/900/600",
      title: "দলীয় প্রশিক্ষণ",
      description: "প্রশিক্ষণ মাঠে একটি দল কঠোর অনুশীলনে রত। প্রত্যেক সদস্য নিজের সেরাটা দিচ্ছে। দলনেতা তাদের উৎসাহিত করছেন।",
      idea: "প্রশিক্ষণের উদ্দেশ্য, বাধা এবং চূড়ান্ত সাফল্য — এই তিনটি ধাপে গল্পটি সাজান।",
    },
    {
      id: "ppdt-pic-3",
      picture_number: 3,
      image_url: "https://picsum.photos/seed/ppdt3/900/600",
      title: "উদ্ধার অভিযান",
      description: "একটি দুর্যোগপূর্ণ পরিস্থিতিতে উদ্ধারকারী দল ঘটনাস্থলে পৌঁছেছে। সময় অত্যন্ত গুরুত্বপূর্ণ — প্রতিটি সেকেন্ড মূল্যবান।",
      idea: "সংকট কতটা গুরুতর, দল কীভাবে সাড়া দিচ্ছে, এবং পরিণতি কী — এই ক্রমানুসারে গল্পটি বলুন।",
    },
    {
      id: "ppdt-pic-4",
      picture_number: 4,
      image_url: "https://picsum.photos/seed/ppdt4/900/600",
      title: "সম্প্রদায় সেবা",
      description: "সামরিক বাহিনীর একটি দল স্থানীয় জনগণের সাহায্যে এগিয়ে এসেছে। তারা একটি কঠিন পরিস্থিতিতে মানুষের পাশে দাঁড়িয়েছে।",
      idea: "মানুষের সমস্যা কী, সামরিক দল কীভাবে সাহায্য করল, এবং শেষে কী পরিবর্তন হলো — এই কাঠামোতে গল্পটি লিখুন।",
    },
  ],
};
