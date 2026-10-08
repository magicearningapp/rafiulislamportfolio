import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  writeBatch 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
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
} from "../types";
import { safeSetLocalStorage, safeGetLocalStorage } from "./storage";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Firestore collections and documents
export const CONTENT_COLLECTION = "portfolio_content";
export const PROJECTS_COLLECTION = "portfolio_projects";
export const PHOTOS_COLLECTION = "portfolio_photos";

export interface FullPortfolioData {
  profile: ProfileData;
  skills: SkillItem[];
  projects: ProjectItem[];
  photos: PhotoItem[];
  contact: ContactData;
  testimonials?: TestimonialItem[];
  timeline?: TimelineItem[];
  caseStudies?: CaseStudyItem[];
  updatedAt?: string;
}

// Get initial local or default data
export function getInitialPortfolioData(): FullPortfolioData {
  try {
    const savedProfile = safeGetLocalStorage("raf_profile");
    const savedSkills = safeGetLocalStorage("raf_skills");
    const savedProjects = safeGetLocalStorage("raf_projects_v4") || safeGetLocalStorage("raf_projects");
    const savedPhotos = safeGetLocalStorage("raf_photos");
    const savedContact = safeGetLocalStorage("raf_contact");
    const savedTestimonials = safeGetLocalStorage("raf_testimonials");
    const savedTimeline = safeGetLocalStorage("raf_timeline");
    const savedCaseStudies = safeGetLocalStorage("raf_case_studies");

    return {
      profile: savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE,
      skills: savedSkills ? JSON.parse(savedSkills) : DEFAULT_SKILLS,
      projects: savedProjects ? JSON.parse(savedProjects) : DEFAULT_PROJECTS,
      photos: savedPhotos ? JSON.parse(savedPhotos) : DEFAULT_PHOTOS,
      contact: savedContact ? JSON.parse(savedContact) : DEFAULT_CONTACT,
      testimonials: savedTestimonials ? JSON.parse(savedTestimonials) : DEFAULT_TESTIMONIALS,
      timeline: savedTimeline ? JSON.parse(savedTimeline) : DEFAULT_TIMELINE,
      caseStudies: savedCaseStudies ? JSON.parse(savedCaseStudies) : DEFAULT_CASE_STUDIES,
    };
  } catch {
    return {
      profile: DEFAULT_PROFILE,
      skills: DEFAULT_SKILLS,
      projects: DEFAULT_PROJECTS,
      photos: DEFAULT_PHOTOS,
      contact: DEFAULT_CONTACT,
      testimonials: DEFAULT_TESTIMONIALS,
      timeline: DEFAULT_TIMELINE,
      caseStudies: DEFAULT_CASE_STUDIES,
    };
  }
}

// Real-time synchronization across all visitors worldwide
export function subscribeToPortfolioData(callback: (data: FullPortfolioData) => void) {
  let currentProfile = getInitialPortfolioData().profile;
  let currentSkills = getInitialPortfolioData().skills;
  let currentContact = getInitialPortfolioData().contact;
  let currentProjects = getInitialPortfolioData().projects;
  let currentPhotos = getInitialPortfolioData().photos;
  let currentTestimonials = getInitialPortfolioData().testimonials || DEFAULT_TESTIMONIALS;
  let currentTimeline = getInitialPortfolioData().timeline || DEFAULT_TIMELINE;
  let currentCaseStudies = getInitialPortfolioData().caseStudies || DEFAULT_CASE_STUDIES;

  let seeded = false;

  const emit = () => {
    const data: FullPortfolioData = {
      profile: currentProfile,
      skills: currentSkills,
      projects: currentProjects,
      photos: currentPhotos,
      contact: currentContact,
      testimonials: currentTestimonials,
      timeline: currentTimeline,
      caseStudies: currentCaseStudies,
    };
    callback(data);
  };

  // 1. Listen to Profile
  const unsubProfile = onSnapshot(doc(db, CONTENT_COLLECTION, "profile"), (snap) => {
    if (snap.exists()) {
      currentProfile = { ...DEFAULT_PROFILE, ...snap.data() } as ProfileData;
      safeSetLocalStorage("raf_profile", JSON.stringify(currentProfile));
      emit();
    } else if (!seeded) {
      setDoc(doc(db, CONTENT_COLLECTION, "profile"), DEFAULT_PROFILE).catch(console.error);
    }
  }, (err) => console.warn("Firestore profile sync error:", err));

  // 2. Listen to Skills
  const unsubSkills = onSnapshot(doc(db, CONTENT_COLLECTION, "skills"), (snap) => {
    if (snap.exists() && snap.data()?.list) {
      currentSkills = snap.data().list as SkillItem[];
      safeSetLocalStorage("raf_skills", JSON.stringify(currentSkills));
      emit();
    } else if (!seeded) {
      setDoc(doc(db, CONTENT_COLLECTION, "skills"), { list: DEFAULT_SKILLS }).catch(console.error);
    }
  }, (err) => console.warn("Firestore skills sync error:", err));

  // 3. Listen to Contact
  const unsubContact = onSnapshot(doc(db, CONTENT_COLLECTION, "contact"), (snap) => {
    if (snap.exists()) {
      currentContact = { ...DEFAULT_CONTACT, ...snap.data() } as ContactData;
      safeSetLocalStorage("raf_contact", JSON.stringify(currentContact));
      emit();
    } else if (!seeded) {
      setDoc(doc(db, CONTENT_COLLECTION, "contact"), DEFAULT_CONTACT).catch(console.error);
    }
  }, (err) => console.warn("Firestore contact sync error:", err));

  // 4. Listen to Testimonials
  const unsubTestimonials = onSnapshot(doc(db, CONTENT_COLLECTION, "testimonials"), (snap) => {
    if (snap.exists() && snap.data()?.list) {
      currentTestimonials = snap.data().list as TestimonialItem[];
      safeSetLocalStorage("raf_testimonials", JSON.stringify(currentTestimonials));
      emit();
    } else if (!seeded) {
      setDoc(doc(db, CONTENT_COLLECTION, "testimonials"), { list: DEFAULT_TESTIMONIALS }).catch(console.error);
    }
  }, (err) => console.warn("Firestore testimonials sync error:", err));

  // 5. Listen to Projects Collection
  const unsubProjects = onSnapshot(collection(db, PROJECTS_COLLECTION), (snap) => {
    if (!snap.empty) {
      const items: (ProjectItem & { order?: number })[] = [];
      snap.forEach((docItem) => {
        items.push({ id: docItem.id, ...docItem.data() } as ProjectItem & { order?: number });
      });
      // Sort by order or keep stability
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      currentProjects = items.map(({ order, ...rest }) => rest);
      safeSetLocalStorage("raf_projects_v4", JSON.stringify(currentProjects));
      emit();
    } else if (!seeded) {
      // Seed default projects to collection
      seedInitialProjects().catch(console.error);
    }
  }, (err) => console.warn("Firestore projects sync error:", err));

  // 6. Listen to Photos Collection
  const unsubPhotos = onSnapshot(collection(db, PHOTOS_COLLECTION), (snap) => {
    if (!snap.empty) {
      const items: (PhotoItem & { order?: number })[] = [];
      snap.forEach((docItem) => {
        items.push({ id: docItem.id, ...docItem.data() } as PhotoItem & { order?: number });
      });
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      currentPhotos = items.map(({ order, ...rest }) => rest);
      safeSetLocalStorage("raf_photos", JSON.stringify(currentPhotos));
      emit();
    } else if (!seeded) {
      // Seed default photos to collection
      seedInitialPhotos().catch(console.error);
    }
  }, (err) => console.warn("Firestore photos sync error:", err));

  // 7. Listen to Timeline
  const unsubTimeline = onSnapshot(doc(db, CONTENT_COLLECTION, "timeline"), (snap) => {
    if (snap.exists() && snap.data()?.list) {
      currentTimeline = snap.data().list as TimelineItem[];
      safeSetLocalStorage("raf_timeline", JSON.stringify(currentTimeline));
      emit();
    } else if (!seeded) {
      setDoc(doc(db, CONTENT_COLLECTION, "timeline"), { list: DEFAULT_TIMELINE }).catch(console.error);
    }
  }, (err) => console.warn("Firestore timeline sync error:", err));

  // 8. Listen to Case Studies
  const unsubCaseStudies = onSnapshot(doc(db, CONTENT_COLLECTION, "case_studies"), (snap) => {
    if (snap.exists() && snap.data()?.list) {
      currentCaseStudies = snap.data().list as CaseStudyItem[];
      safeSetLocalStorage("raf_case_studies", JSON.stringify(currentCaseStudies));
      emit();
    } else if (!seeded) {
      setDoc(doc(db, CONTENT_COLLECTION, "case_studies"), { list: DEFAULT_CASE_STUDIES }).catch(console.error);
    }
  }, (err) => console.warn("Firestore case studies sync error:", err));

  seeded = true;

  return () => {
    unsubProfile();
    unsubSkills();
    unsubContact();
    unsubTestimonials();
    unsubProjects();
    unsubPhotos();
    unsubTimeline();
    unsubCaseStudies();
  };
}

// Seed helper functions
async function seedInitialProjects() {
  const batch = writeBatch(db);
  DEFAULT_PROJECTS.forEach((proj, idx) => {
    const docRef = doc(db, PROJECTS_COLLECTION, proj.id);
    batch.set(docRef, { ...proj, order: idx, updatedAt: new Date().toISOString() });
  });
  await batch.commit();
}

async function seedInitialPhotos() {
  const batch = writeBatch(db);
  DEFAULT_PHOTOS.forEach((photo, idx) => {
    const docRef = doc(db, PHOTOS_COLLECTION, photo.id);
    batch.set(docRef, { ...photo, order: idx, updatedAt: new Date().toISOString() });
  });
  await batch.commit();
}

// Save Profile
export async function saveProfileToCloud(profile: ProfileData): Promise<void> {
  safeSetLocalStorage("raf_profile", JSON.stringify(profile));
  const docRef = doc(db, CONTENT_COLLECTION, "profile");
  await setDoc(docRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
}

// Save Skills
export async function saveSkillsToCloud(skills: SkillItem[]): Promise<void> {
  safeSetLocalStorage("raf_skills", JSON.stringify(skills));
  const docRef = doc(db, CONTENT_COLLECTION, "skills");
  await setDoc(docRef, { list: skills, updatedAt: new Date().toISOString() }, { merge: true });
}

// Save Contact
export async function saveContactToCloud(contact: ContactData): Promise<void> {
  safeSetLocalStorage("raf_contact", JSON.stringify(contact));
  const docRef = doc(db, CONTENT_COLLECTION, "contact");
  await setDoc(docRef, { ...contact, updatedAt: new Date().toISOString() }, { merge: true });
}

// Save Testimonials
export async function saveTestimonialsToCloud(testimonials: TestimonialItem[]): Promise<void> {
  safeSetLocalStorage("raf_testimonials", JSON.stringify(testimonials));
  const docRef = doc(db, CONTENT_COLLECTION, "testimonials");
  await setDoc(docRef, { list: testimonials, updatedAt: new Date().toISOString() }, { merge: true });
}

// Save All Projects in collection
export async function saveProjectsToCloud(projects: ProjectItem[]): Promise<void> {
  safeSetLocalStorage("raf_projects_v4", JSON.stringify(projects));
  
  // Get existing documents in collection
  const existingDocs = await getDocs(collection(db, PROJECTS_COLLECTION));
  const existingIds = new Set(existingDocs.docs.map((d) => d.id));
  const currentIds = new Set(projects.map((p) => p.id));

  // Batch delete items that were removed
  const batch = writeBatch(db);
  existingDocs.docs.forEach((d) => {
    if (!currentIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  // Batch set/update current items with order
  projects.forEach((p, idx) => {
    const docRef = doc(db, PROJECTS_COLLECTION, p.id);
    batch.set(docRef, { ...p, order: idx, updatedAt: new Date().toISOString() });
  });

  await batch.commit();
}

// Save All Photos in collection
export async function savePhotosToCloud(photos: PhotoItem[]): Promise<void> {
  safeSetLocalStorage("raf_photos", JSON.stringify(photos));

  // Get existing documents in collection
  const existingDocs = await getDocs(collection(db, PHOTOS_COLLECTION));
  const currentIds = new Set(photos.map((p) => p.id));

  // Batch delete items that were removed
  const batch = writeBatch(db);
  existingDocs.docs.forEach((d) => {
    if (!currentIds.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  // Batch set/update current items with order
  photos.forEach((photo, idx) => {
    const docRef = doc(db, PHOTOS_COLLECTION, photo.id);
    batch.set(docRef, { ...photo, order: idx, updatedAt: new Date().toISOString() });
  });

  await batch.commit();
}

// Save Timeline
export async function saveTimelineToCloud(timeline: TimelineItem[]): Promise<void> {
  safeSetLocalStorage("raf_timeline", JSON.stringify(timeline));
  const docRef = doc(db, CONTENT_COLLECTION, "timeline");
  await setDoc(docRef, { list: timeline, updatedAt: new Date().toISOString() }, { merge: true });
}

// Save Case Studies
export async function saveCaseStudiesToCloud(caseStudies: CaseStudyItem[]): Promise<void> {
  safeSetLocalStorage("raf_case_studies", JSON.stringify(caseStudies));
  const docRef = doc(db, CONTENT_COLLECTION, "case_studies");
  await setDoc(docRef, { list: caseStudies, updatedAt: new Date().toISOString() }, { merge: true });
}

// Generic multi-save
export async function savePortfolioToCloud(data: Partial<FullPortfolioData>): Promise<void> {
  const promises: Promise<any>[] = [];

  if (data.profile) promises.push(saveProfileToCloud(data.profile));
  if (data.skills) promises.push(saveSkillsToCloud(data.skills));
  if (data.contact) promises.push(saveContactToCloud(data.contact));
  if (data.testimonials) promises.push(saveTestimonialsToCloud(data.testimonials));
  if (data.projects) promises.push(saveProjectsToCloud(data.projects));
  if (data.photos) promises.push(savePhotosToCloud(data.photos));
  if (data.timeline) promises.push(saveTimelineToCloud(data.timeline));
  if (data.caseStudies) promises.push(saveCaseStudiesToCloud(data.caseStudies));

  await Promise.all(promises);
}

// Reset everything to defaults across Cloud Firestore
export async function resetCloudPortfolioToDefaults(): Promise<void> {
  // Clear projects collection
  const projSnap = await getDocs(collection(db, PROJECTS_COLLECTION));
  const batch = writeBatch(db);
  projSnap.forEach((d) => batch.delete(d.ref));

  // Clear photos collection
  const photoSnap = await getDocs(collection(db, PHOTOS_COLLECTION));
  photoSnap.forEach((d) => batch.delete(d.ref));

  // Reset profile, skills, contact, testimonials, timeline, case studies docs
  batch.set(doc(db, CONTENT_COLLECTION, "profile"), DEFAULT_PROFILE);
  batch.set(doc(db, CONTENT_COLLECTION, "skills"), { list: DEFAULT_SKILLS });
  batch.set(doc(db, CONTENT_COLLECTION, "contact"), DEFAULT_CONTACT);
  batch.set(doc(db, CONTENT_COLLECTION, "testimonials"), { list: DEFAULT_TESTIMONIALS });
  batch.set(doc(db, CONTENT_COLLECTION, "timeline"), { list: DEFAULT_TIMELINE });
  batch.set(doc(db, CONTENT_COLLECTION, "case_studies"), { list: DEFAULT_CASE_STUDIES });

  // Re-seed default projects & photos
  DEFAULT_PROJECTS.forEach((p, idx) => {
    batch.set(doc(db, PROJECTS_COLLECTION, p.id), { ...p, order: idx });
  });
  DEFAULT_PHOTOS.forEach((ph, idx) => {
    batch.set(doc(db, PHOTOS_COLLECTION, ph.id), { ...ph, order: idx });
  });

  await batch.commit();
}
