import portrait1 from "./assets/images/raf_portrait_1_1783564539626.jpg";
import portrait2 from "./assets/images/raf_portrait_2_1783564555655.jpg";
import workspacePhoto from "./assets/images/raf_workspace_1783564569957.jpg";
import rafiulCvPortrait from "./assets/images/rafiul_executive_cv_1791127424295.jpg";
import garenaBanner from "./assets/images/garena_topup_banner_1788077708358.jpg";
import discoverPabnaBanner from "./assets/images/discover_pabna_landmarks_1788077693665.jpg";
import masalaSkunjoBanner from "./assets/images/masala_skunjo_food_1788077679212.jpg";
import amagoPabnaBanner from "./assets/images/pabna_heritage_culture_1788077650318.jpg";
import convoMeetBanner from "./assets/images/convomeet_platform_1788077665261.jpg";
import sunsetPhoto from "./assets/images/scenic_sunset_nature_1788077932029.jpg";
import archPhoto from "./assets/images/historic_street_arch_1788077949370.jpg";
import natureLilyPhoto from "./assets/images/monsoon_green_nature_1788077966305.jpg";

export const CANDIDATE_IMAGE_OPTIONS = [
  { id: "cv_official", label: "Executive Studio Portrait", labelBn: "অফিসিয়াল স্টুডিও পোর্ট্রেট", url: rafiulCvPortrait },
  { id: "workspace", label: "Creative Workspace / In-Action", labelBn: "ওয়ার্কস্পেস / কর্মক্ষেত্র", url: workspacePhoto },
  { id: "portrait_outdoor", label: "Signature Portrait 1", labelBn: "সিগনেচার পোর্ট্রেট ১", url: portrait1 },
  { id: "portrait_studio2", label: "Signature Portrait 2", labelBn: "সিগনেচার পোর্ট্রেট ২", url: portrait2 },
];

export interface SkillItem {
  id: string;
  name: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  category?: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  caption: string;
  image: string; // Cover image
  images?: string[]; // Multiple images for album / series posts
  category: string;
  location?: string;
  date?: string;
  tags?: string[];
}

export interface ProfileSocials {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

export interface CustomCvFileInfo {
  name: string;
  type: string; // 'docx' | 'pdf' | 'doc'
  dataUrl: string;
  size?: string;
  uploadedAt: string;
}

export interface CvPersonalDetails {
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  religion?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  contactNo?: string;
  secondaryContact?: string;
  permanentAddress?: {
    name?: string;
    careOf?: string;
    village?: string;
    post?: string;
    policeStation?: string;
    district?: string;
  };
  presentAddress?: {
    name?: string;
    careOf?: string;
    village?: string;
    post?: string;
    policeStation?: string;
    district?: string;
  };
  hsc?: {
    institute: string;
    group: string;
    board: string;
    duration: string;
    passingYear: string;
    result: string;
  };
  ssc?: {
    institute: string;
    group: string;
    board: string;
    duration: string;
    passingYear: string;
    result: string;
  };
  languages?: { language: string; readingWriting: string; spoken: string }[];
  interests?: string;
  hobby?: string;
  declaration?: string;
}

export interface ProfileData {
  name: string;
  title: string;
  location: string;
  shortIntro: string;
  about: string;
  photo: string;
  footerText: string;
  socials?: ProfileSocials;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  customCvFile?: CustomCvFileInfo;
  cvPersonalDetails?: CvPersonalDetails;
}

export interface ContactData {
  facebook: string;
  youtube: string;
  whatsapp: string;
  email: string;
  secondaryPhone?: string;
}

export const DEFAULT_PROFILE: ProfileData = {
  name: "MD. RAFIUL ISLAM",
  title: "Social Media Manager & Content Creator",
  location: "Pabna, Bangladesh",
  shortIntro: "To work in an responsible position where I could use my Interpersonal skills, Creative and above all my learning experience in order to develop my career as well as to contribution in any sector.",
  about: "To work in an responsible position where I could use my Interpersonal skills, Creative and above all my learning experience in order to develop my career as well as to contribution in any sector.",
  photo: rafiulCvPortrait,
  footerText: "© 2026 Md. Rafiul Islam. All rights reserved.",
  socials: {
    facebook: "https://facebook.com/rafiulislam",
    instagram: "https://instagram.com/rafiulislam",
    linkedin: "https://linkedin.com/in/rafiulislam",
  },
  facebook: "https://facebook.com/rafiulislam",
  instagram: "https://instagram.com/rafiulislam",
  linkedin: "https://linkedin.com/in/rafiulislam",
  cvPersonalDetails: {
    fatherName: "Md. Shawkat Ali",
    motherName: "Most. Shahana Begum",
    dateOfBirth: "1st December, 1996",
    gender: "Male",
    maritalStatus: "Unmarried",
    nationality: "Bangladeshi (By birth)",
    religion: "Islam (Sunni)",
    height: "5'- 7\"",
    weight: "69 Kg",
    contactNo: "+8801701- 008254",
    secondaryContact: "+8801784-275274",
    permanentAddress: {
      name: "Md. Rafiul Islam",
      careOf: "Md. Shawkat Ali",
      village: "South Ramchandrapur",
      post: "Pabna",
      policeStation: "Pabna Sadar",
      district: "Pabna",
    },
    presentAddress: {
      name: "Md. Rafiul Islam",
      careOf: "Md. Shawkat Ali",
      village: "South Ramchandrapur",
      post: "Pabna",
      policeStation: "Pabna Sadar",
      district: "Pabna",
    },
    hsc: {
      institute: "Shahid Bulbul Govt. College, Pabna",
      group: "Humanities",
      board: "Rajshahi",
      duration: "2 Years",
      passingYear: "2013",
      result: "GPA- 3.40 out of 5.00",
    },
    ssc: {
      institute: "Gopal Chandra Institution, Pabna",
      group: "Humanities",
      board: "Rajshahi",
      duration: "2 Years",
      passingYear: "2011",
      result: "GPA- 4.19 out of 5.00",
    },
    languages: [
      { language: "Bengali", readingWriting: "Excellent", spoken: "Excellent" },
      { language: "English", readingWriting: "Good", spoken: "Good" },
    ],
    interests: "I have interested about sports, film, traveling, reading & the story etc.",
    hobby: "Reading Books and News Paper.",
    declaration: "I, Undersigned certify that to the best of my knowledge and belief this resume correctly describes my qualifications and me. Any willful misstatement described herein may lead to my disqualification or dismissal, if employed.",
  },
};

export const DEFAULT_SKILLS: SkillItem[] = [
  {
    id: "s1",
    name: "Social Media Management",
    description: "End-to-end platform management, audience growth strategies, publishing schedules, and engagement optimization.",
  },
  {
    id: "s2",
    name: "Content Creation",
    description: "Creative visual assets, copywriting, brand storytelling, and interactive social posts designed to captivate.",
  },
  {
    id: "s3",
    name: "Video Editing",
    description: "High-retention short-form (Reels, TikToks, Shorts) and long-form video editing with crisp pacing and visuals.",
  },
  {
    id: "s4",
    name: "Digital Marketing",
    description: "Strategic campaign planning, brand positioning, audience segmentation, and organic growth acceleration.",
  },
];

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "p1",
    title: "Garena Topup BD",
    description: "A fast and responsive gaming top-up web application featuring instant package selection, seamless pricing display, and streamlined customer ordering flow.",
    image: "/projects/garena.jpg",
    link: "https://garenatopupbd.netlify.app",
    category: "Gaming Top-Up Platform",
  },
  {
    id: "p2",
    title: "Discover Pabna",
    description: "A comprehensive local tourism and community portal highlighting popular landmarks, historical places, local heritage, and visitor guides for Pabna district.",
    image: "/projects/discover_pabna.jpg",
    link: "https://discoverpabna.netlify.app/",
    category: "Tourism & City Portal",
  },
  {
    id: "p3",
    title: "Masala Skunjo",
    description: "An elegant, mouth-watering food & restaurant website crafted with modern visual aesthetics, rich menu showcases, and direct contact options.",
    image: "/projects/masala_skunjo.jpg",
    link: "https://masalaskunjo.netlify.app/",
    category: "Restaurant Website",
  },
  {
    id: "p4",
    title: "Amago Pabnar Bhasha",
    description: "An interactive digital cultural portal and dialect archive preserving the regional language, indigenous expressions, folklore, and linguistic heritage of Pabna.",
    image: "/projects/amago_pabna.jpg",
    link: "https://amagopabnarbhasha.netlify.app/",
    category: "Cultural Archive & Dialect",
  },
  {
    id: "p5",
    title: "ConvoMeet",
    description: "A modern, high-performance real-time video meeting and conferencing platform with audio-video collaboration, room scheduling, and seamless connectivity.",
    image: "/projects/convomeet.jpg",
    link: "https://convomeet.netlify.app/",
    category: "Video Conferencing App",
  },
];

export const DEFAULT_CONTACT: ContactData = {
  facebook: "https://facebook.com/rafiulislam",
  youtube: "https://youtube.com",
  whatsapp: "+8801784-275274",
  email: "rafiulislam125@gmail.com",
  secondaryPhone: "+8801701- 008254",
};

export const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: "ph1",
    title: "Golden Hour Over River Padma",
    caption: "Capturing the serene silhouette of traditional fishing boats against the crimson evening sky in Pabna.",
    image: sunsetPhoto,
    category: "Landscape",
    location: "Padma River, Pabna",
    date: "2026",
  },
  {
    id: "ph2",
    title: "Echoes of Heritage Architecture",
    caption: "Sunlight illuminating the weathered terracotta bricks and ancient arches of historic Bengal landmarks.",
    image: archPhoto,
    category: "Architecture",
    location: "Historic Estate, Bangladesh",
    date: "2026",
  },
  {
    id: "ph3",
    title: "Emerald Calm & Water Lily",
    caption: "A tranquil morning capturing national water lilies blossoming across rural wetland reservoirs.",
    image: natureLilyPhoto,
    category: "Nature",
    location: "Rural Countryside",
    date: "2026",
  },
];

export type ReactionType = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry";

export interface ReactionConfig {
  type: ReactionType;
  label: string;
  labelBn: string;
  emoji: string;
  color: string; // text color
  bgColor: string;
}

export const FB_REACTIONS: ReactionConfig[] = [
  { type: "like", label: "Like", labelBn: "লাইক", emoji: "👍", color: "text-blue-600", bgColor: "bg-blue-50" },
  { type: "love", label: "Love", labelBn: "লাভ", emoji: "❤️", color: "text-rose-600", bgColor: "bg-rose-50" },
  { type: "care", label: "Care", labelBn: "কেয়ার", emoji: "🥰", color: "text-amber-500", bgColor: "bg-amber-50" },
  { type: "haha", label: "Haha", labelBn: "হাহা", emoji: "😆", color: "text-yellow-600", bgColor: "bg-yellow-50" },
  { type: "wow", label: "Wow", labelBn: "ওয়াও", emoji: "😮", color: "text-yellow-600", bgColor: "bg-yellow-50" },
  { type: "sad", label: "Sad", labelBn: "স্যাড", emoji: "😢", color: "text-amber-600", bgColor: "bg-amber-50" },
  { type: "angry", label: "Angry", labelBn: "এংগ্রি", emoji: "😡", color: "text-orange-600", bgColor: "bg-orange-50" },
];

export interface PhotoReactionSummary {
  photoId: string;
  counts: Record<ReactionType, number>;
  total: number;
  userReaction?: ReactionType | null;
}

export interface PhotoCommentItem {
  id: string;
  photoId: string;
  authorName: string;
  text: string;
  createdAt: string;
  clientKey?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  quote: string;
  comment?: string;
  rating: number; // 1-5
  projectTitle?: string;
  metric?: string;
  date?: string;
}

export interface TimelineItem {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  type: "work" | "education" | "award";
  description: string;
  skills: string[];
}

export const DEFAULT_TIMELINE: TimelineItem[] = [
  {
    id: "tl1",
    period: "2024 — Present",
    role: "Senior Social Media Strategist & Brand Consultant",
    company: "Independent & Brand Partnerships",
    location: "Bangladesh & Global Remote",
    type: "work",
    description: "Managing full-funnel digital presence for 50+ clients, high-retention video strategies, paid/organic convergence, and generating 3.4x average reach multiplier.",
    skills: ["Meta Business Suite", "Reels & TikTok Strategy", "Audience Funnels", "Brand Positioning"],
  },
  {
    id: "tl2",
    period: "2022 — 2024",
    role: "Lead Content Creator & Video Editor",
    company: "Digital Media Agency",
    location: "Pabna, Bangladesh",
    type: "work",
    description: "Produced cinematic food reels, e-commerce product videos, and community narratives with high retention metrics across Facebook, YouTube, and TikTok.",
    skills: ["Adobe Premiere Pro", "CapCut Pro", "Copywriting", "Storytelling"],
  },
  {
    id: "tl3",
    period: "2020 — 2022",
    role: "Digital Marketing Specialist & Community Builder",
    company: "Regional Brand Initiatives",
    location: "Bangladesh",
    type: "work",
    description: "Scaled local community platforms to 68k+ members, organized digital marketing campaigns, and managed photo documentary series.",
    skills: ["Audience Growth", "Community Engagement", "Digital PR", "Photography"],
  },
  {
    id: "tl4",
    period: "2011 — 2013",
    role: "Higher Secondary Certificate (H.S.C)",
    company: "Shahid Bulbul Govt. College, Pabna",
    location: "Pabna, Rajshahi Board",
    type: "education",
    description: "Humanities Group. Duration: 2 Years. Result: GPA- 3.40 out of 5.00. Completed higher secondary studies with distinction.",
    skills: ["Humanities", "Academic Research", "Bengali Literature", "Analytical Thinking"],
  },
  {
    id: "tl5",
    period: "2009 — 2011",
    role: "Secondary School Certificate (S.S.C)",
    company: "Gopal Chandra Institution, Pabna",
    location: "Pabna, Rajshahi Board",
    type: "education",
    description: "Humanities Group. Duration: 2 Years. Result: GPA- 4.19 out of 5.00. Completed secondary secondary school certificate with high excellence.",
    skills: ["Humanities", "Communication", "Social Studies"],
  },
];

export interface CaseStudyItem {
  id: string;
  brand: string;
  industry: string;
  industryBn?: string;
  summary: string;
  summaryBn?: string;
  metricBadge: string;
  before: {
    reach: string;
    engagement: string;
    videoViews: string;
    followers: string;
    challenges: string[];
    challengesBn?: string[];
  };
  after: {
    reach: string;
    engagement: string;
    videoViews: string;
    followers: string;
    results: string[];
    resultsBn?: string[];
  };
  quote: string;
  quoteAuthor: string;
}

export const DEFAULT_CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "masala",
    brand: "Masala Skunjo Restaurant",
    industry: "Dining & Hospitality",
    industryBn: "ডাইনিং ও হসপিটালিটি",
    summary: "Restructured organic social presence using food-prep reels, customer reviews, and local geo-targeting.",
    summaryBn: "ফুড প্রিপারেশন রিলস, কাস্টমার রিভিউ এবং জিও-টার্গেটিং ব্যবহারের মাধ্যমে পেজের সার্বিক রূপান্তর।",
    metricBadge: "+340% Reach Multiplier",
    before: {
      reach: "3.2k / mo",
      engagement: "1.4%",
      videoViews: "4.5k",
      followers: "4,200",
      challenges: [
        "Static low-resolution food photos",
        "Irregular posting schedule",
        "Low direct message reservation rate",
      ],
      challengesBn: [
        "কম রেজোলিউশনের সাধারণ ছবি",
        "অনিয়মিত পোস্ট সিডিউল",
        "টেবিল বুকিং বা মেসেজের স্বল্পতা",
      ],
    },
    after: {
      reach: "145k+ / mo",
      engagement: "7.8%",
      videoViews: "380k+",
      followers: "18,400+",
      results: [
        "High-retention cinematic food reels",
        "Consistent 4x weekly storytelling",
        "Weekend table reservations quadrupled",
      ],
      resultsBn: [
        "উচ্চ রিটেনশনের সিনেমাটিক ফুড রিলস",
        "সপ্তাহে ৪টি ধারাবাহিক স্টোরিটেলিং পোস্ট",
        "উইকেন্ডে টেবিল বুকিং ৪ গুণ বৃদ্ধি",
      ],
    },
    quote: "Rafiul completely changed the face of our online marketing. Customers now visit us showing reels he edited!",
    quoteAuthor: "Founder, Masala Skunjo",
  },
  {
    id: "amago",
    brand: "Amago Pabna Community",
    industry: "Culture & Regional Media",
    industryBn: "সংস্কৃতি ও রিজিওনাল মিডিয়া",
    summary: "Turned a stagnant regional page into one of the largest active organic community hubs in Northern Bengal.",
    summaryBn: "পাবনার সংস্কৃতি ও ইতিবাচক ঘটনা তুলে ধরে উত্তরবঙ্গের অন্যতম সক্রিয় কমিউনিটি পেজে রূপান্তর।",
    metricBadge: "1.2M+ Monthly Views",
    before: {
      reach: "18k / mo",
      engagement: "2.1%",
      videoViews: "25k",
      followers: "12,000",
      challenges: [
        "Copy-pasted news snippets with high drop-off",
        "Lack of visual identity & original video",
      ],
      challengesBn: [
        "সাধারণ নিউজ কপি-পেস্ট ও কম এনগেজমেন্ট",
        "নিজস্ব ভিডিও ও ব্র্যান্ড আইডেন্টিটির অভাব",
      ],
    },
    after: {
      reach: "650k+ / mo",
      engagement: "9.2%",
      videoViews: "1.2M+",
      followers: "68,000+",
      results: [
        "Original photo documentary & cultural reels",
        "3,000+ average comments & active shares per week",
        "Recognized as trusted regional community media",
      ],
      resultsBn: [
        "অরিজিনাল ফটো ডকুমেন্টারি ও কালচারাল রিলস",
        "সপ্তাহে গড়ে ৩,০০০+ সক্রিয় কমেন্ট ও শেয়ার",
        "বিশ্বস্ত স্থানীয় কমিউনিটি প্ল্যাটফর্ম হিসেবে স্বীকৃতি",
      ],
    },
    quote: "The engagement numbers speak for themselves. The page gained tremendous respect and organic love.",
    quoteAuthor: "Community Coordinator",
  },
  {
    id: "garena",
    brand: "Digital Community Platform",
    industry: "Gaming & E-Commerce",
    industryBn: "গেমিং ও ই-কমার্স",
    summary: "Built automated customer response funnels, weekly interactive community contests, and instant trust proof.",
    summaryBn: "কমিউনিটি কনটেস্ট, ইনস্ট্যান্ট রেসপন্স ফানেল এবং সিকিউর সার্ভিস প্রুফিংয়ের মাধ্যমে আস্থার উন্নয়ন।",
    metricBadge: "+420% Customer Loyalty",
    before: {
      reach: "9.5k / mo",
      engagement: "1.8%",
      videoViews: "12k",
      followers: "8,500",
      challenges: [
        "High skepticism regarding online transactions",
        "Slow inquiry response times",
      ],
      challengesBn: [
        "অনলাইন লেনদেন নিয়ে ক্রেতাদের দ্বিধা",
        "মেসেজের ধীরগতির উত্তর",
      ],
    },
    after: {
      reach: "88k+ / mo",
      engagement: "8.4%",
      videoViews: "210k+",
      followers: "24,000+",
      results: [
        "Instant social proof testimonials & trust badge",
        "98% positive sentiment rating in community",
        "Daily recurring customer retention increased by 3.2x",
      ],
      resultsBn: [
        "স্বচ্ছ সোশ্যাল প্রুফ ও ক্লায়েন্ট রিভিউ শোকেস",
        "কমিউনিটিতে ৯৮% ইতিবাচক রেটিং ও রিভিউ",
        "পুনরায় সার্ভিস নেওয়ার হার ৩.২ গুণ বৃদ্ধি",
      ],
    },
    quote: "Transactions became so smooth once Rafiul structured our customer proof stories and social campaigns.",
    quoteAuthor: "Operations Head",
  },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "t1",
    name: "Tanvir Ahmed",
    role: "Founder & CEO",
    company: "NextGen Gaming BD",
    quote: "Rafiul transformed our social media reach and gaming community presence. His strategic content creation and engagement techniques increased our monthly active followers by 340% within 90 days. He doesn't just manage posts—he genuinely understands audience psychology and brand storytelling.",
    rating: 5,
    projectTitle: "Garena Topup BD Platform & Socials",
    metric: "+340% Community Growth",
    date: "August 2026",
  },
  {
    id: "t2",
    name: "Nusrat Jahan",
    role: "Marketing Director",
    company: "Discover Pabna Tourism Initiative",
    quote: "Working with Rafiul on the Discover Pabna portal and promotional video series was a phenomenal experience. His creative direction, responsive web development, and drone landscape photography captured the true essence of our heritage. We received over 50,000 views in the launch week alone!",
    rating: 5,
    projectTitle: "Discover Pabna Web Portal & Reels",
    metric: "50,000+ First-Week Views",
    date: "July 2026",
  },
  {
    id: "t3",
    name: "Kazi Minhazur Rahman",
    role: "Managing Director",
    company: "Masala Skunjo Gourmet Dining",
    quote: "Rafiul delivered a stunning modern website and a viral food reel campaign that brought an influx of table bookings. His attention to detail, speedy execution, and proactive communication make him our go-to digital strategist for all future expansions.",
    rating: 5,
    projectTitle: "Masala Skunjo Web & Visual Brand",
    metric: "4.8x Table Reservations",
    date: "June 2026",
  },
  {
    id: "t4",
    name: "Farhana Yasmin",
    role: "Community Lead",
    company: "Heritage Bangla Dialect Archive",
    quote: "Rafiul is exceptionally talented at translating complex cultural ideas into captivating, high-retention video content and interactive web platforms. His video pacing, audio balancing, and design sensibilities are truly world-class.",
    rating: 5,
    projectTitle: "Amago Pabna Cultural Archive",
    metric: "98% Positive Feedback",
    date: "May 2026",
  },
  {
    id: "t5",
    name: "Shakil Hossain",
    role: "Product Manager",
    company: "TechConvo Network",
    quote: "From responsive web UI architecture to high-converting social campaigns, Rafiul brings rare dual expertise in engineering and content strategy. His work exceeded all benchmarks for retention and user acquisition.",
    rating: 5,
    projectTitle: "ConvoMeet Platform & Video Campaign",
    metric: "12,000+ Active Users",
    date: "April 2026",
  },
];

