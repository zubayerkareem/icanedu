export const PICTURE_STORY_COURSE_ID = "issb1";

export interface PictureStoryPicture {
  id: string;
  picture_number: number;
  image_url: string;
  title: string;
  description: string;
  idea: string;
}

export interface PictureStorySet {
  id: string;
  name: string;
  pictures: PictureStoryPicture[];
}

export const PICTURE_STORY_MOCK_SET: PictureStorySet = {
  id: "ps-set-1",
  name: "Picture Story Set 1",
  pictures: [
    {
      id: "ps-p1",
      picture_number: 1,
      image_url: "https://picsum.photos/seed/military1/900/600",
      title: "উপকূল টহল",
      description: "মেজর আসাদ একজন কোস্টগার্ড অফিসার। তার দায়িত্ব উপকূলীয় এলাকাকে জলদস্যু ও চোরাকারবারিদের থেকে রক্ষা করা। মেজর আসাদ ও তার বাহিনী উপকূলীয় এলাকায় টহল দিচ্ছে।",
      idea: "ছবিতে দলগত কাজ ও নেতৃত্বের বিষয়টি ফুটিয়ে তুলুন। কে নেতৃত্ব দিচ্ছে, কী পরিস্থিতি, এবং শেষে কী ঘটল — এই তিনটি প্রশ্নের উত্তর দিয়ে গল্পটি সম্পূর্ণ করুন।",
    },
    {
      id: "ps-p2",
      picture_number: 2,
      image_url: "https://picsum.photos/seed/military2/900/600",
      title: "দলীয় সংকট",
      description: "একটি দল পাহাড়ি অঞ্চলে অভিযানে রয়েছে। হঠাৎ একজন সদস্য আহত হন। দলনেতাকে দ্রুত সিদ্ধান্ত নিতে হবে — অভিযান চালিয়ে যাবেন, নাকি আহতকে নিয়ে ফিরে যাবেন।",
      idea: "মানবিকতা বনাম দায়িত্ব — দলনেতা উভয় দিক বিবেচনা করে একটি সাহসী ও মানবিক সিদ্ধান্ত নেন যা দলকে ঐক্যবদ্ধ রাখে।",
    },
    {
      id: "ps-p3",
      picture_number: 3,
      image_url: "https://picsum.photos/seed/military3/900/600",
      title: "সেতু পারাপার",
      description: "রাত গভীর। একটি সামরিক দল একটি সংকীর্ণ সেতু পার হওয়ার চেষ্টা করছে। সামনে অনিশ্চিত পরিস্থিতি, পেছনে শত্রুর অনুসরণ।",
      idea: "সংকটকালে দলের মনোবল ধরে রাখা এবং সঠিক কৌশলে এগিয়ে যাওয়াই সাফল্যের চাবিকাঠি — গল্পে এই বার্তাটি রাখুন।",
    },
    {
      id: "ps-p4",
      picture_number: 4,
      image_url: "https://picsum.photos/seed/military4/900/600",
      title: "পুরস্কার বিতরণী",
      description: "একটি বিশেষ অনুষ্ঠানে সফল অভিযানের স্বীকৃতিস্বরূপ দলের সদস্যদের পুরস্কার প্রদান করা হচ্ছে। সিনিয়র অফিসার তাদের সাহসিকতার প্রশংসা করছেন।",
      idea: "কঠোর পরিশ্রম ও দলীয় সহযোগিতার ফলেই এই সাফল্য — গল্পে কীভাবে দলটি এই পুরস্কার অর্জন করল তা বর্ণনা করুন।",
    },
  ],
};
