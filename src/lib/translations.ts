export type Language = "en" | "bn";

export interface Translations {
  nav: {
    about: string;
    skills: string;
    works: string;
    caseStudies: string;
    reviews: string;
    gallery: string;
    contact: string;
    hireMe: string;
    admin: string;
  };
  hero: {
    availabilityBadge: string;
    title: string;
    shortIntro: string;
    contactBtn: string;
    viewWorkBtn: string;
    downloadCvBtn: string;
    getQuoteBtn: string;
  };
  about: {
    badge: string;
    title: string;
    timelineBadge: string;
    timelineTitle: string;
    downloadResume: string;
  };
  skills: {
    badge: string;
    title: string;
    subtitle: string;
  };
  works: {
    badge: string;
    title: string;
    subtitle: string;
    previewBtn: string;
    visitSiteBtn: string;
    emptyText: string;
  };
  caseStudies: {
    badge: string;
    title: string;
    subtitle: string;
    beforeLabel: string;
    afterLabel: string;
    viewCase: string;
  };
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    writeReview: string;
    trustScore: string;
    projectsDelivered: string;
    avgRating: string;
    reachMultiplier: string;
  };
  gallery: {
    badge: string;
    title: string;
    subtitle: string;
    allCategory: string;
    protectedBadge: string;
    shareBtn: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    socialsBadge: string;
    socialsTitle: string;
    socialsSubtitle: string;
    copyBtn: string;
    copiedBtn: string;
  };
  footer: {
    rights: string;
    backToTop: string;
  };
  quoteModal: {
    title: string;
    subtitle: string;
    servicesTitle: string;
    budgetTitle: string;
    timelineTitle: string;
    detailsTitle: string;
    namePlaceholder: string;
    brandPlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    briefPlaceholder: string;
    sendWhatsappBtn: string;
    sendEmailBtn: string;
    closeBtn: string;
    successMsg: string;
  };
  reviewModal: {
    title: string;
    subtitle: string;
    nameLabel: string;
    roleLabel: string;
    companyLabel: string;
    ratingLabel: string;
    metricLabel: string;
    reviewLabel: string;
    submitBtn: string;
    submittingBtn: string;
    successMsg: string;
  };
  theme: {
    nightMode: string;
    dayMode: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      about: "About",
      skills: "Skills",
      works: "Works",
      caseStudies: "Case Studies",
      reviews: "Reviews",
      gallery: "Photography",
      contact: "Contact",
      hireMe: "Hire Me / Quote",
      admin: "Admin",
    },
    hero: {
      availabilityBadge: "Open to New SMM & Content Projects",
      title: "Social Media Manager & Content Creator",
      shortIntro:
        "I help brands, creators, and businesses build an authentic digital presence, increase audience engagement, and scale through organic social media growth and high-impact content.",
      contactBtn: "Contact Me",
      viewWorkBtn: "View My Work",
      downloadCvBtn: "Download CV",
      getQuoteBtn: "Get a Free Quote",
    },
    about: {
      badge: "Biography",
      title: "About Me",
      timelineBadge: "Career Milestones",
      timelineTitle: "Experience & Education Timeline",
      downloadResume: "View / Print Full CV",
    },
    skills: {
      badge: "Expertise",
      title: "Skills & Services",
      subtitle:
        "Core areas of specialization honed through professional practice and real-world results.",
    },
    works: {
      badge: "Portfolio",
      title: "My Works & Projects",
      subtitle:
        "Featured websites, web applications, and digital platforms developed with modern technologies. Click any project to preview the full scrollable homepage.",
      previewBtn: "Full Preview",
      visitSiteBtn: "Visit Live Site",
      emptyText: "No projects added yet.",
    },
    caseStudies: {
      badge: "Proven Results",
      title: "Social Growth Case Studies",
      subtitle:
        "Data-driven before & after transformations showcasing organic reach, engagement retention, and brand expansion.",
      beforeLabel: "Before SMM Strategy",
      afterLabel: "After Rafiul's Management",
      viewCase: "Explore Case Study",
    },
    testimonials: {
      badge: "Client Feedback & Social Proof",
      title: "Trusted by Brands, Creators & Businesses",
      subtitle:
        "Read how our dedicated social media management, organic audience strategy, and digital platforms delivered measurable growth and brand elevation for past clients.",
      writeReview: "Write a Review",
      trustScore: "Client Satisfaction",
      projectsDelivered: "Projects Delivered",
      avgRating: "Average Review Rating",
      reachMultiplier: "Average Reach Multiplier",
    },
    gallery: {
      badge: "Personal Gallery",
      title: "My Photography",
      subtitle:
        "A curated visual collection capturing serene landscapes, heritage architecture, and the vibrant essence of life through my lens.",
      allCategory: "All",
      protectedBadge:
        "Protected visual content • Original photography by Md. Rafiul Islam",
      shareBtn: "Share Gallery",
    },
    contact: {
      badge: "Get In Touch",
      title: "Let's Work Together",
      subtitle:
        "Have a project in mind or want to grow your social channels? Reach out directly through any of the channels below.",
      socialsBadge: "Socials",
      socialsTitle: "Social Media Profiles",
      socialsSubtitle:
        "Follow along for daily social updates, content growth case studies, and networking.",
      copyBtn: "Copy",
      copiedBtn: "Copied",
    },
    footer: {
      rights: "All rights reserved.",
      backToTop: "Back to Top",
    },
    quoteModal: {
      title: "Request a Project Quote",
      subtitle:
        "Select your requirements below to instantly generate a tailored proposal via WhatsApp or Email.",
      servicesTitle: "Required Services",
      budgetTitle: "Estimated Budget",
      timelineTitle: "Project Timeline",
      detailsTitle: "Your Details",
      namePlaceholder: "Your Full Name *",
      brandPlaceholder: "Brand / Business / Company Name",
      emailPlaceholder: "Email Address *",
      phonePlaceholder: "WhatsApp / Phone Number *",
      briefPlaceholder: "Tell me about your goals, target audience, or current challenges...",
      sendWhatsappBtn: "Send via WhatsApp",
      sendEmailBtn: "Submit Proposal Request",
      closeBtn: "Close",
      successMsg: "Your inquiry has been submitted! I will get back to you within 24 hours.",
    },
    reviewModal: {
      title: "Submit Client Testimonial",
      subtitle: "Share your experience working with Md. Rafiul Islam to inspire others.",
      nameLabel: "Your Name *",
      roleLabel: "Your Role / Title (e.g. Founder, Marketing Lead)",
      companyLabel: "Company / Brand Name",
      ratingLabel: "Rating (Stars)",
      metricLabel: "Key Metric Achieved (e.g. +340% Reach, 1M+ Views)",
      reviewLabel: "Your Feedback & Review *",
      submitBtn: "Submit Review for Verification",
      submittingBtn: "Submitting...",
      successMsg:
        "Thank you! Your testimonial has been submitted and will appear on the live site after verification.",
    },
    theme: {
      nightMode: "Kolapata Night",
      dayMode: "Kolapata Day",
    },
  },
  bn: {
    nav: {
      about: "পরিচিতি",
      skills: "দক্ষতা",
      works: "প্রজেক্টসমূহ",
      caseStudies: "কেস স্টাডি",
      reviews: "রিভিউ",
      gallery: "ফটোগ্রাফি",
      contact: "যোগাযোগ",
      hireMe: "হায়ার করুন / কোটেশন",
      admin: "অ্যাডমিন",
    },
    hero: {
      availabilityBadge: "সোশ্যাল মিডিয়া ও কন্টেন্ট প্রজেক্টের জন্য উন্মুক্ত",
      title: "সোশ্যাল মিডিয়া ম্যানেজার ও কন্টেন্ট ক্রিয়েটর",
      shortIntro:
        "আমি ব্র্যান্ড, ক্রিয়েটর ও ব্যবসা প্রতিষ্ঠানকে একটি শক্তিশালী ডিজিটাল উপস্থিতি তৈরি করতে, ফলোয়ার এনগেজমেন্ট বাড়াতে এবং অর্গানিক গ্রোথের মাধ্যমে স্কেল করতে সাহায্য করি।",
      contactBtn: "যোগাযোগ করুন",
      viewWorkBtn: "কাজের নমুনা দেখুন",
      downloadCvBtn: "সিভি ডাউনলোড",
      getQuoteBtn: "ফ্রি কোটেশন নিন",
    },
    about: {
      badge: "জীবনবৃত্তান্ত",
      title: "আমার সম্পর্কে",
      timelineBadge: "কর্মজীবনের মাইলফলক",
      timelineTitle: "অভিজ্ঞতা ও শিক্ষাগত টাইমলাইন",
      downloadResume: "সম্পূর্ণ সিভি দেখুন / প্রিন্ট",
    },
    skills: {
      badge: "বিশেষ পারদর্শিতা",
      title: "দক্ষতা ও সেবাসমূহ",
      subtitle:
        "বাস্তবমুখী অভিজ্ঞতা এবং দীর্ঘদিনের চর্চায় অর্জিত প্রফেশনাল দক্ষতাসমূহ।",
    },
    works: {
      badge: "পোর্টফোলিও",
      title: "আমার কাজ ও প্রজেক্টসমূহ",
      subtitle:
        "আধুনিক প্রযুক্তিতে নির্মিত উল্লেখযোগ্য ওয়েবসাইট, অ্যাপ ও সোশ্যাল মিডিয়া ক্যাম্পেইন। পুরো সাইট প্রিভিউ দেখতে ক্লিক করুন।",
      previewBtn: "সম্পূর্ণ প্রিভিউ",
      visitSiteBtn: "লাইভ সাইট দেখুন",
      emptyText: "এখনো কোনো প্রজেক্ট যুক্ত করা হয়নি।",
    },
    caseStudies: {
      badge: "প্রমাণিত ফলাফল",
      title: "গ্রোথ কেস স্টাডি (আগে বনাম পরে)",
      subtitle:
        "সোশ্যাল মিডিয়া স্ট্র্যাটেজি ব্যবহারের মাধ্যমে কীভাবে পেজের রিচ, ভিডিও ভিউ এবং ফলোয়ার বৃদ্ধি পেয়েছে তার বাস্তব প্রমাণ।",
      beforeLabel: "কাজের আগের অবস্থা",
      afterLabel: "রাফিউলের ম্যানেজমেন্টের পর",
      viewCase: "বিস্তারিত কেস স্টাডি",
    },
    testimonials: {
      badge: "ক্লায়েন্ট ফিডব্যাক ও সোশ্যাল প্রুফ",
      title: "ক্লায়েন্ট এবং পার্টনারদের মতামত",
      subtitle:
        "জেনে নিন আমাদের ডেডিকেটেড সোশ্যাল মিডিয়া ম্যানেজমেন্ট এবং ডিজিটাল স্ট্র্যাটেজি ক্লায়েন্টদের ব্যবসায়িক লক্ষ্য অর্জনে কীভাবে সহায়তা করেছে।",
      writeReview: "রিভিউ লিখুন",
      trustScore: "ক্লায়েন্ট সন্তুষ্টি",
      projectsDelivered: "সম্পন্ন প্রজেক্ট",
      avgRating: "গড় রেটিং",
      reachMultiplier: "গড় রিচ মাল্টিপ্লায়ার",
    },
    gallery: {
      badge: "ব্যক্তিগত গ্যালারি",
      title: "আমার ফটোগ্রাফি",
      subtitle:
        "ক্যামেরার লেন্সে বন্দী বাংলার অপরূপ প্রকৃতি, ঐতিহ্যবাহী স্থাপত্য ও জীবনের ছন্দ।",
      allCategory: "সব ছবি",
      protectedBadge:
        "কপিরাইট সংরক্ষিত ভিজ্যুয়াল কন্টেন্ট • মোঃ রাফিউল ইসলাম",
      shareBtn: "গ্যালারি শেয়ার করুন",
    },
    contact: {
      badge: "যোগাযোগ",
      title: "চলুন একসাথে কাজ শুরু করি",
      subtitle:
        "নতুন কোনো প্রজেক্ট অথবা সোশ্যাল মিডিয়া গ্রোথ নিয়ে আলোচনা করতে নিচের যেকোনো মাধ্যমে যোগাযোগ করুন।",
      socialsBadge: "সোশ্যালস",
      socialsTitle: "সোশ্যাল মিডিয়া প্রোফাইল",
      socialsSubtitle:
        "প্রতিদিনের আপডেট, গ্রোথ টিপস ও নেটওয়ার্কিংয়ের জন্য সোশ্যাল প্রোফাইলগুলোতে যুক্ত থাকুন।",
      copyBtn: "কপি",
      copiedBtn: "কপি হয়েছে",
    },
    footer: {
      rights: "সর্বস্বত্ব সংরক্ষিত।",
      backToTop: "উপরে যান",
    },
    quoteModal: {
      title: "প্রজেক্ট কোটেশন রিকোয়েস্ট",
      subtitle:
        "আপনার প্রয়োজনীয় সার্ভিস সিলেক্ট করুন, এক ক্লিকেই রেডিমেড মেসেজ সহ হোয়াটসঅ্যাপ বা ইমেইলে যোগাযোগ করুন।",
      servicesTitle: "প্রয়োজনীয় সেবাসমূহ",
      budgetTitle: "সম্ভাব্য বাজেট",
      timelineTitle: "কাজের সময়সীমা",
      detailsTitle: "আপনার তথ্য",
      namePlaceholder: "আপনার পূর্ণ নাম *",
      brandPlaceholder: "ব্র্যান্ড / ব্যবসা প্রতিষ্ঠানের নাম",
      emailPlaceholder: "ইমেইল অ্যাড্রেস *",
      phonePlaceholder: "হোয়াটসঅ্যাপ / মোবাইল নম্বর *",
      briefPlaceholder: "আপনার প্রজেক্টের লক্ষ্য, অডিয়েন্স বা বর্তমান চ্যালেঞ্জ সম্পর্কে লিখুন...",
      sendWhatsappBtn: "হোয়াটসঅ্যাপে পাঠান",
      sendEmailBtn: "প্রস্তাবনা জমা দিন",
      closeBtn: "বন্ধ করুন",
      successMsg: "আপনার ইনকোয়ারি সফলভাবে পাঠানো হয়েছে! ২৪ ঘণ্টার মধ্যে যোগাযোগ করা হবে।",
    },
    reviewModal: {
      title: "ক্লায়েন্ট রিভিউ জমা দিন",
      subtitle: "মোঃ রাফিউল ইসলামের সাথে কাজের অভিজ্ঞতা শেয়ার করুন।",
      nameLabel: "আপনার নাম *",
      roleLabel: "পদবী (যেমন: ফাউন্ডার, ম্যানেজার)",
      companyLabel: "কোম্পানি বা ব্র্যান্ডের নাম",
      ratingLabel: "স্টার রেটিং",
      metricLabel: "অর্জিত ফলাফল (যেমন: +৩০০% রিচ বৃদ্ধি)",
      reviewLabel: "আপনার ফিডব্যাক ও রিভিউ *",
      submitBtn: "রিভিউ জমা দিন",
      submittingBtn: "জমা হচ্ছে...",
      successMsg:
        "ধন্যবাদ! আপনার রিভিউটি গ্রহণ করা হয়েছে। ভেরিফিকেশনের পর এটি লাইভ সাইটে যুক্ত হবে।",
    },
    theme: {
      nightMode: "কলা Wolapata নাইট",
      dayMode: "কলা Wolapata ডে",
    },
  },
};
