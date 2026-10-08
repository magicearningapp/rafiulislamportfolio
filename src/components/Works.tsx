import { useState } from "react";
import { ProjectItem } from "../types";
import { ExternalLink, FolderGit2, Globe, Eye } from "lucide-react";
import { motion } from "motion/react";
import { resolveProjectImage, getWebsiteScreenshotUrl } from "../lib/projectImages";
import WebsitePreviewModal from "./WebsitePreviewModal";
import { useThemeLanguage } from "../context/ThemeLanguageContext";

interface WorksProps {
  projects: ProjectItem[];
}

interface ProjectCardProps {
  key?: string;
  project: ProjectItem;
  index: number;
  onOpenPreview: (project: ProjectItem) => void;
}

function ProjectCard({ project, index, onOpenPreview }: ProjectCardProps) {
  const initialImg = resolveProjectImage(project);
  const [currentImg, setCurrentImg] = useState(initialImg);
  const [hasFailed, setHasFailed] = useState(false);

  const handleImageError = () => {
    // If the image failed and has a website link, try screenshot preview
    if (project.link && project.link.startsWith("http")) {
      const screenshotUrl = getWebsiteScreenshotUrl(project.link);
      if (currentImg !== screenshotUrl) {
        setCurrentImg(screenshotUrl);
        return;
      }
    }
    setHasFailed(true);
  };

  // Extract clean domain for browser top bar
  let displayDomain = "";
  try {
    if (project.link) {
      const parsed = new URL(project.link);
      displayDomain = parsed.hostname.replace(/^www\./, "");
    }
  } catch {
    displayDomain = project.link || "";
  }

  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col bg-white dark:bg-[#0F2013] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 rounded-2xl overflow-hidden hover:border-[#8FAF72] hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(143,175,114,0.25)] hover:-translate-y-1 transition-all duration-300 shadow-xs"
    >
      {/* Website Browser Header Mockup */}
      <div 
        onClick={() => onOpenPreview(project)}
        className="bg-[#F4F1E6] dark:bg-[#152B1B] border-b border-[#8FAF72]/30 dark:border-[#8FAF72]/45 px-3.5 py-2 flex items-center justify-between cursor-pointer"
        title="Click to preview full homepage"
      >
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2F5D3A]/80 dark:bg-[#A3E699]/80" />
        </div>
        {displayDomain && (
          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-white dark:bg-[#0F2013] text-[11px] font-mono text-[#4E5E4E] dark:text-[#A3E699] border border-[#8FAF72]/30 dark:border-[#8FAF72]/50 max-w-[200px] truncate shadow-2xs">
            <Globe className="w-2.5 h-2.5 text-[#467A4A] dark:text-[#A3E699] shrink-0" />
            <span className="truncate">{displayDomain}</span>
          </div>
        )}
      </div>

      {/* Project Preview Image with Interactive Full-Page Preview Trigger */}
      <div 
        onClick={() => onOpenPreview(project)}
        className="relative aspect-video sm:aspect-[16/10] bg-[#173522] overflow-hidden cursor-pointer"
      >
        {!hasFailed && currentImg ? (
          <div className="relative w-full h-full">
            <img
              src={currentImg}
              alt={project.title}
              onError={handleImageError}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Interactive Hover Overlay to signal automated full homepage auto-scroll */}
            <div className="absolute inset-0 bg-[#173522]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center backdrop-blur-[2px]">
              <div className="px-3.5 py-1.5 rounded-full bg-[#F4F1E6] text-[#173522] font-bold text-xs flex items-center space-x-1.5 shadow-lg transform -translate-y-1 group-hover:translate-y-0 transition-transform">
                <Eye className="w-3.5 h-3.5 text-[#2F5D3A]" />
                <span>View Full Homepage</span>
              </div>
              <span className="text-[10px] text-[#8FAF72] mt-1.5 font-medium">
                Complete top to footer preview
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#173522] to-[#1F452B] text-[#8FAF72] p-6 text-center space-y-2">
            <FolderGit2 className="w-10 h-10 text-[#8FAF72]" />
            <span className="text-xs font-medium text-[#F4F1E6]">{project.title}</span>
            <button
              onClick={() => onOpenPreview(project)}
              className="text-[11px] text-[#8FAF72] hover:text-white inline-flex items-center space-x-1 underline cursor-pointer"
            >
              <span>Open Project Preview</span>
            </button>
          </div>
        )}

        {project.category && (
          <span className="absolute bottom-3 left-3 bg-[#1F452B]/85 backdrop-blur-md text-[11px] font-semibold text-[#F4F1E6] px-2.5 py-1 rounded-md border border-[#8FAF72]/30 shadow-xs pointer-events-none">
            {project.category}
          </span>
        )}
      </div>

      {/* Project Information */}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 
            onClick={() => onOpenPreview(project)}
            className="text-lg font-bold text-[#172117] dark:text-white leading-snug group-hover:text-[#2F5D3A] dark:group-hover:text-[#A3E699] transition-colors cursor-pointer"
          >
            {project.title}
          </h3>
          <p className="text-sm text-[#4E5E4E] dark:text-[#DCE8DD] line-clamp-3 leading-relaxed font-normal">
            {project.description}
          </p>
        </div>

        {/* Project Links & Actions */}
        {project.link ? (
          <div className="pt-3 border-t border-[#8FAF72]/30 dark:border-[#8FAF72]/50 flex items-center justify-between gap-2">
            <button
              onClick={() => onOpenPreview(project)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#2F5D3A] dark:text-[#A3E699] hover:text-[#173522] dark:hover:text-white transition-colors cursor-pointer group-hover:underline"
            >
              <Eye className="w-3.5 h-3.5 text-[#467A4A] dark:text-[#A3E699]" />
              <span>Preview Homepage</span>
            </button>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#4E5E4E] dark:text-zinc-200 hover:text-[#172117] dark:hover:text-white transition-colors"
              title="Open live website in a new window"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function Works({ projects }: WorksProps) {
  const { t } = useThemeLanguage();
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = (project: ProjectItem) => {
    setSelectedProject(project);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <section id="works" className="py-20 md:py-28 px-6 sm:px-8 border-b border-[#8FAF72]/30 relative">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px", amount: 0.1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto space-y-12"
      >
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#467A4A]">
            {t.works.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172117]">
            {t.works.title}
          </h2>
          <p className="text-[#4E5E4E] text-sm sm:text-base">
            {t.works.subtitle}
          </p>
        </div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center py-16 border border-dashed border-[#8FAF72]/40 rounded-2xl bg-white/80 backdrop-blur-xs"
          >
            <p className="text-[#4E5E4E] text-sm">{t.works.emptyText}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {projects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index} 
                onOpenPreview={handleOpenPreview}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Full-Page Scrollable Website Preview Modal */}
      <WebsitePreviewModal
        project={selectedProject}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </section>
  );
}
