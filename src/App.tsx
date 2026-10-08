import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Works from "./components/Works";
import Testimonials from "./components/Testimonials";
import Gallery from "./components/Gallery";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";
import BackToTop from "./components/BackToTop";
import ScrollProgressBar from "./components/ScrollProgressBar";
import CaseStudies from "./components/CaseStudies";
import QuoteModal from "./components/QuoteModal";
import ResumeModal from "./components/ResumeModal";
import ReviewSubmissionModal from "./components/ReviewSubmissionModal";
import {
  ProfileData,
  SkillItem,
  ProjectItem,
  PhotoItem,
  ContactData,
  TestimonialItem,
  TimelineItem,
  CaseStudyItem,
  DEFAULT_PROFILE,
  DEFAULT_SKILLS,
  DEFAULT_PROJECTS,
  DEFAULT_PHOTOS,
  DEFAULT_CONTACT,
  DEFAULT_TESTIMONIALS,
  DEFAULT_TIMELINE,
  DEFAULT_CASE_STUDIES,
} from "./types";
import { 
  subscribeToPortfolioData, 
  resetCloudPortfolioToDefaults, 
  getInitialPortfolioData,
  savePortfolioToCloud 
} from "./lib/firebase";
import { safeSetLocalStorage } from "./lib/storage";

export default function App() {
  // Routing State: 'public' or 'admin'
  const [currentRoute, setCurrentRoute] = useState<"public" | "admin">(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/admin" || window.location.hash === "#admin") {
        return "admin";
      }
    }
    return "public";
  });

  // Listen to browser URL changes / popstate
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === "/admin" || window.location.hash === "#admin") {
        setCurrentRoute("admin");
      } else {
        setCurrentRoute("public");
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigateToAdmin = () => {
    setCurrentRoute("admin");
    window.history.pushState(null, "", "/admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToPublic = () => {
    setCurrentRoute("public");
    window.history.pushState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Initial Data
  const initialData = getInitialPortfolioData();

  // State: Profile & Hero
  const [profile, setProfile] = useState<ProfileData>(initialData.profile || DEFAULT_PROFILE);

  // State: Skills
  const [skills, setSkills] = useState<SkillItem[]>(initialData.skills || DEFAULT_SKILLS);

  // State: Projects / Works
  const [projects, setProjects] = useState<ProjectItem[]>(initialData.projects || DEFAULT_PROJECTS);

  // State: Photography / Gallery
  const [photos, setPhotos] = useState<PhotoItem[]>(initialData.photos || DEFAULT_PHOTOS);

  // State: Contact Info
  const [contact, setContact] = useState<ContactData>(initialData.contact || DEFAULT_CONTACT);

  // State: Client Testimonials & Social Proof
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    initialData.testimonials || DEFAULT_TESTIMONIALS
  );

  // State: Experience & Education Timeline
  const [timeline, setTimeline] = useState<TimelineItem[]>(
    initialData.timeline || DEFAULT_TIMELINE
  );

  // State: Growth Case Studies (Before vs After)
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>(
    initialData.caseStudies || DEFAULT_CASE_STUDIES
  );

  // Interactive Modals State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Subscribe to real-time Cloud Firestore updates across all devices & visitors worldwide
  useEffect(() => {
    const unsubscribe = subscribeToPortfolioData((cloudData) => {
      if (cloudData.profile) setProfile(cloudData.profile);
      if (cloudData.skills) setSkills(cloudData.skills);
      if (cloudData.projects) setProjects(cloudData.projects);
      if (cloudData.photos) setPhotos(cloudData.photos);
      if (cloudData.contact) setContact(cloudData.contact);
      if (cloudData.testimonials) setTestimonials(cloudData.testimonials);
      if (cloudData.timeline) setTimeline(cloudData.timeline);
      if (cloudData.caseStudies) setCaseStudies(cloudData.caseStudies);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Dynamic Document Title and Meta Tag Injection for SEO & Social Media Sharing
  useEffect(() => {
    if (typeof document === "undefined") return;

    const pageTitle =
      currentRoute === "admin"
        ? `Admin Panel — ${profile.name || "Portfolio"}`
        : `${profile.name || "Md. Rafiul Islam"} — ${profile.title || "Social Media Manager & Content Creator"}`;

    const metaDescription =
      profile.shortIntro?.trim() ||
      profile.about?.slice(0, 160).trim() ||
      "Personal portfolio of Md. Rafiul Islam, Social Media Manager & Content Creator based in Bangladesh.";

    // 1. Update Document Title
    document.title = pageTitle;

    // Helper to safely set or create a <meta> tag
    const setMetaTag = (attributeName: "name" | "property", attributeValue: string, content: string) => {
      if (!content) return;
      let metaEl = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!metaEl) {
        metaEl = document.createElement("meta");
        metaEl.setAttribute(attributeName, attributeValue);
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute("content", content);
    };

    // 2. Standard Meta Description
    setMetaTag("name", "description", metaDescription);

    // 3. OpenGraph / Social Media Tags
    setMetaTag("property", "og:type", "profile");
    setMetaTag("property", "og:title", pageTitle);
    setMetaTag("property", "og:description", metaDescription);
    setMetaTag("property", "og:site_name", `${profile.name || "Md. Rafiul Islam"} Portfolio`);

    if (typeof window !== "undefined") {
      setMetaTag("property", "og:url", window.location.href);

      // Handle profile photo for preview sharing
      if (profile.photo) {
        const photoUrl = profile.photo.startsWith("http")
          ? profile.photo
          : `${window.location.origin}${profile.photo.startsWith("/") ? "" : "/"}${profile.photo}`;
        setMetaTag("property", "og:image", photoUrl);
        setMetaTag("property", "og:image:alt", profile.name || "Profile Photo");
        setMetaTag("name", "twitter:image", photoUrl);
      }
    }

    // 4. Twitter / X Card Tags
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", pageTitle);
    setMetaTag("name", "twitter:description", metaDescription);

    // 5. Schema.org Structured Data (JSON-LD)
    let jsonLdScript = document.querySelector("#portfolio-structured-data") as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.id = "portfolio-structured-data";
      jsonLdScript.type = "application/ld+json";
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.name || "Md. Rafiul Islam",
      jobTitle: profile.title || "Social Media Manager & Content Creator",
      description: metaDescription,
      address: {
        "@type": "PostalAddress",
        addressCountry: profile.location || "Bangladesh",
      },
      url: typeof window !== "undefined" ? window.location.origin : "",
      image:
        profile.photo && typeof window !== "undefined"
          ? profile.photo.startsWith("http")
            ? profile.photo
            : `${window.location.origin}${profile.photo.startsWith("/") ? "" : "/"}${profile.photo}`
          : undefined,
    };
    jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
  }, [profile, currentRoute]);

  // Reset all to defaults
  const handleResetDefaults = async () => {
    localStorage.removeItem("raf_profile");
    localStorage.removeItem("raf_skills");
    localStorage.removeItem("raf_projects_v4");
    localStorage.removeItem("raf_photos");
    localStorage.removeItem("raf_contact");
    localStorage.removeItem("raf_testimonials");
    localStorage.removeItem("raf_timeline");
    localStorage.removeItem("raf_case_studies");
    localStorage.removeItem("raf_admin_password");

    setProfile(DEFAULT_PROFILE);
    setSkills(DEFAULT_SKILLS);
    setProjects(DEFAULT_PROJECTS);
    setPhotos(DEFAULT_PHOTOS);
    setContact(DEFAULT_CONTACT);
    setTestimonials(DEFAULT_TESTIMONIALS);
    setTimeline(DEFAULT_TIMELINE);
    setCaseStudies(DEFAULT_CASE_STUDIES);

    try {
      await resetCloudPortfolioToDefaults();
    } catch (err) {
      console.error("Error resetting cloud database:", err);
    }
  };

  // Render Admin View
  if (currentRoute === "admin") {
    return (
      <AdminPanel
        profile={profile}
        setProfile={setProfile}
        skills={skills}
        setSkills={setSkills}
        projects={projects}
        setProjects={setProjects}
        photos={photos}
        setPhotos={setPhotos}
        contact={contact}
        setContact={setContact}
        testimonials={testimonials}
        setTestimonials={setTestimonials}
        timeline={timeline}
        setTimeline={setTimeline}
        caseStudies={caseStudies}
        setCaseStudies={setCaseStudies}
        onClose={navigateToPublic}
        onResetDefaults={handleResetDefaults}
      />
    );
  }

  // Render Public Website Single Page
  return (
    <div className="min-h-screen bg-[#F4F1E6] text-[#172117] selection:bg-[#173522] selection:text-[#F4F1E6] flex flex-col font-sans relative overflow-hidden">
      {/* 0. Slim Scroll Progress Bar at very top of screen */}
      <ScrollProgressBar />

      {/* Dynamic Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern opacity-60" />
      
      {/* Soft Luminous Color Spheres for Modern Aesthetic Depth - Kolapata Palette */}
      <div className="fixed -top-40 -left-40 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-br from-[#8FAF72]/45 via-[#467A4A]/25 to-transparent blur-3xl pointer-events-none z-0 animate-ambient-1" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-bl from-[#2F5D3A]/25 via-[#8FAF72]/20 to-transparent blur-3xl pointer-events-none z-0 animate-ambient-2" />
      <div className="fixed -bottom-40 left-1/4 w-96 h-96 sm:w-[550px] sm:h-[550px] rounded-full bg-gradient-to-tr from-[#8FAF72]/50 via-[#F4F1E6] to-transparent blur-3xl pointer-events-none z-0 animate-ambient-1" />

      {/* 1. Navbar */}
      <Navbar
        onNavigateAdmin={navigateToAdmin}
        brandName={profile.name}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
      />

      {/* Main Single Page Content */}
      <main className="flex-1 w-full relative z-10">
        {/* 2. Hero Section */}
        <Hero
          profile={profile}
          onOpenResumeModal={() => setIsResumeModalOpen(true)}
          onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        />

        {/* 3. About Me Section & Career Timeline */}
        <About
          aboutText={profile.about}
          onOpenResumeModal={() => setIsResumeModalOpen(true)}
          timeline={timeline}
        />

        {/* 4. Skills Section */}
        <Skills skills={skills} />

        {/* 5. My Works / Projects Section */}
        <Works projects={projects} />

        {/* 6. Growth Case Studies (Before vs After) */}
        <CaseStudies items={caseStudies} />

        {/* 7. Client Testimonials & Social Proof (Auto-Playing Carousel + Review Submission) */}
        <Testimonials
          testimonials={testimonials}
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
        />

        {/* 8. Personal Photography Gallery */}
        <Gallery photos={photos} />

        {/* 9. Contact & Social Profiles Section */}
        <Contact contact={contact} profile={profile} />
      </main>

      {/* 10. Footer */}
      <Footer footerText={profile.footerText} onNavigateAdmin={navigateToAdmin} />

      {/* 11. Floating Back to Top Button */}
      <BackToTop />

      {/* 12. Interactive Project Quote Estimator Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        whatsappNumber={contact.whatsapp}
        emailAddress={contact.email}
      />

      {/* 13. Download / View Full Professional CV Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={profile}
        onUpdateProfile={(updatedProfile) => {
          setProfile(updatedProfile);
          safeSetLocalStorage("raf_profile", JSON.stringify(updatedProfile));
          savePortfolioToCloud({ profile: updatedProfile });
        }}
        contact={contact}
        skills={skills}
        timeline={timeline}
        projects={projects}
      />

      {/* 14. Client Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
