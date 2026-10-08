import { useState, useEffect, type MouseEvent, type SyntheticEvent } from "react";
import { PhotoItem, PhotoReactionSummary, PhotoCommentItem } from "../types";
import FacebookReactions from "./FacebookReactions";
import PhotoCommentsSection from "./PhotoCommentsSection";
import {
  subscribeToAllReactions,
  subscribeToAllComments,
  getClientId,
} from "../lib/reactionsAndComments";
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
  ShieldAlert,
  Tag,
  Layers,
  Images,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ShareButton from "./ShareButton";
import { useThemeLanguage } from "../context/ThemeLanguageContext";

interface GalleryProps {
  photos: PhotoItem[];
  onToast?: (msg: string) => void;
}

export default function Gallery({ photos, onToast }: GalleryProps) {
  const { t, language } = useThemeLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [activeAlbumImageIndex, setActiveAlbumImageIndex] = useState<number>(0);
  const [cardImageIndices, setCardImageIndices] = useState<Record<string, number>>({});
  const [reactionsMap, setReactionsMap] = useState<Record<string, PhotoReactionSummary>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, PhotoCommentItem[]>>({});
  const [expandedCommentsPhotoId, setExpandedCommentsPhotoId] = useState<string | null>(null);

  // Subscribe to real-time reactions and comments
  useEffect(() => {
    const clientId = getClientId();
    const unsubReactions = subscribeToAllReactions(clientId, (map) => {
      setReactionsMap(map);
    });
    const unsubComments = subscribeToAllComments((map) => {
      setCommentsMap(map);
    });
    return () => {
      unsubReactions();
      unsubComments();
    };
  }, []);

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(photos.map((p) => p.category).filter(Boolean)))];

  const filteredPhotos =
    selectedCategory === "All"
      ? photos
      : photos.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  // Deep linking: Open photo from URL hash (e.g. #gallery?photo=ph_1 or ?photo=ph_1 or #photo-ph_1)
  useEffect(() => {
    const handleCheckDeepLink = () => {
      if (typeof window === "undefined" || photos.length === 0) return;

      const hash = window.location.hash;
      const search = window.location.search;
      let targetPhotoId: string | null = null;

      // Check ?photo= in search
      const searchParams = new URLSearchParams(search);
      if (searchParams.get("photo")) {
        targetPhotoId = searchParams.get("photo");
      }

      // Check hash like #gallery?photo=id or #photo-id
      if (!targetPhotoId && hash) {
        if (hash.includes("photo=")) {
          const match = hash.match(/photo=([^&]+)/);
          if (match) targetPhotoId = decodeURIComponent(match[1]);
        } else if (hash.startsWith("#photo-")) {
          targetPhotoId = hash.replace("#photo-", "");
        }
      }

      if (targetPhotoId) {
        const foundIndex = photos.findIndex((p) => p.id === targetPhotoId);
        if (foundIndex !== -1) {
          setSelectedCategory("All");
          setActiveLightboxIndex(foundIndex);
          setActiveAlbumImageIndex(0);

          // Smooth scroll to gallery
          const el = document.getElementById("gallery");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };

    handleCheckDeepLink();
    window.addEventListener("hashchange", handleCheckDeepLink);
    window.addEventListener("popstate", handleCheckDeepLink);
    return () => {
      window.removeEventListener("hashchange", handleCheckDeepLink);
      window.removeEventListener("popstate", handleCheckDeepLink);
    };
  }, [photos]);

  const openLightbox = (index: number, albumImgIdx = 0) => {
    setActiveLightboxIndex(index);
    setActiveAlbumImageIndex(albumImgIdx);
    const photo = filteredPhotos[index];
    if (photo && typeof window !== "undefined") {
      window.history.replaceState(null, "", `/#gallery?photo=${photo.id}`);
    }
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
    setActiveAlbumImageIndex(0);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/#gallery");
    }
  };

  const nextPost = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (activeLightboxIndex !== null) {
      const nextIdx = (activeLightboxIndex + 1) % filteredPhotos.length;
      setActiveLightboxIndex(nextIdx);
      setActiveAlbumImageIndex(0);
      const photo = filteredPhotos[nextIdx];
      if (photo && typeof window !== "undefined") {
        window.history.replaceState(null, "", `/#gallery?photo=${photo.id}`);
      }
    }
  };

  const prevPost = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (activeLightboxIndex !== null) {
      const prevIdx = (activeLightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
      setActiveLightboxIndex(prevIdx);
      setActiveAlbumImageIndex(0);
      const photo = filteredPhotos[prevIdx];
      if (photo && typeof window !== "undefined") {
        window.history.replaceState(null, "", `/#gallery?photo=${photo.id}`);
      }
    }
  };

  const nextAlbumImage = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (activeLightboxIndex !== null) {
      const photo = filteredPhotos[activeLightboxIndex];
      const albumImages = photo.images && photo.images.length > 0 ? photo.images : [photo.image];
      if (activeAlbumImageIndex < albumImages.length - 1) {
        setActiveAlbumImageIndex(activeAlbumImageIndex + 1);
      } else {
        nextPost();
      }
    }
  };

  const prevAlbumImage = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (activeLightboxIndex !== null) {
      const photo = filteredPhotos[activeLightboxIndex];
      const albumImages = photo.images && photo.images.length > 0 ? photo.images : [photo.image];
      if (activeAlbumImageIndex > 0) {
        setActiveAlbumImageIndex(activeAlbumImageIndex - 1);
      } else {
        prevPost();
      }
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextAlbumImage();
      if (e.key === "ArrowLeft") prevAlbumImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, activeAlbumImageIndex, filteredPhotos.length]);

  // Prevent right-click context menu and drag
  const handlePreventDefault = (e: SyntheticEvent) => {
    e.preventDefault();
  };

  const handleCardNextImage = (e: MouseEvent, photo: PhotoItem) => {
    e.stopPropagation();
    const imgs = photo.images && photo.images.length > 0 ? photo.images : [photo.image];
    const current = cardImageIndices[photo.id] || 0;
    setCardImageIndices((prev) => ({
      ...prev,
      [photo.id]: (current + 1) % imgs.length,
    }));
  };

  const handleCardPrevImage = (e: MouseEvent, photo: PhotoItem) => {
    e.stopPropagation();
    const imgs = photo.images && photo.images.length > 0 ? photo.images : [photo.image];
    const current = cardImageIndices[photo.id] || 0;
    setCardImageIndices((prev) => ({
      ...prev,
      [photo.id]: (current - 1 + imgs.length) % imgs.length,
    }));
  };

  return (
    <section
      id="gallery"
      className="py-20 md:py-28 px-6 sm:px-8 border-b border-[#8FAF72]/30 bg-[#8FAF72]/10 backdrop-blur-xs select-none relative"
      onContextMenu={handlePreventDefault}
    >
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px", amount: 0.1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto space-y-10"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#1F452B] text-[#8FAF72] text-[11px] font-medium tracking-wide">
                <Camera className="w-3.5 h-3.5" />
                <span>{t.gallery.badge}</span>
              </div>
              <ShareButton section="gallery" label={t.gallery.shareBtn} onToast={onToast} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172117]">
              {t.gallery.title}
            </h2>
            <p className="text-[#4E5E4E] text-sm sm:text-base leading-relaxed">
              {t.gallery.subtitle}
            </p>
          </div>

          {/* Categories Filter Tabs */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#8FAF72]/25 rounded-xl max-w-fit">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-white text-[#172117] shadow-xs"
                      : "text-[#4E5E4E] hover:text-[#172117]"
                  }`}
                >
                  {cat === "All" ? t.gallery.allCategory : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Protection Banner Note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center space-x-2 text-[11px] text-[#4E5E4E] bg-white/80 border border-[#8FAF72]/35 px-3.5 py-1.5 rounded-lg shadow-2xs"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#467A4A] shrink-0" />
          <span>{t.gallery.protectedBadge}</span>
        </motion.div>

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-[#8FAF72]/40 rounded-2xl space-y-3">
            <Camera className="w-10 h-10 text-[#8FAF72] mx-auto" />
            <p className="text-[#4E5E4E] text-sm">No photos found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredPhotos.map((photo, index) => {
              const cardImages = photo.images && photo.images.length > 0 ? photo.images : [photo.image];
              const cardImgIndex = cardImageIndices[photo.id] || 0;
              const displayedImage = cardImages[cardImgIndex] || photo.image;

              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => openLightbox(index, cardImgIndex)}
                  onContextMenu={handlePreventDefault}
                  className="group relative bg-white border border-[#8FAF72]/35 rounded-xl overflow-hidden shadow-2xs hover:border-[#8FAF72] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Image Container with Anti-Download Shield */}
                  <div className="relative aspect-[4/3] bg-[#F4F1E6] overflow-hidden select-none">
                    {/* The Photo */}
                    <img
                      src={displayedImage}
                      alt={photo.title}
                      onContextMenu={handlePreventDefault}
                      onDragStart={handlePreventDefault}
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                      referrerPolicy="no-referrer"
                      style={{
                        WebkitUserSelect: "none",
                        userSelect: "none",
                      }}
                    />

                    {/* Anti-Save Transparent Protection Layer */}
                    <div
                      className="absolute inset-0 bg-transparent z-10 select-none cursor-pointer"
                      onContextMenu={handlePreventDefault}
                      onDragStart={handlePreventDefault}
                    />

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15 pointer-events-none" />

                    {/* Category Pill */}
                    {photo.category && (
                      <span className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md text-[11px] font-medium text-white px-2.5 py-1 rounded-md border border-white/10 shadow-xs pointer-events-none">
                        {photo.category}
                      </span>
                    )}

                    {/* Album Badge */}
                    {cardImages.length > 1 && (
                      <span className="absolute top-3 right-12 z-20 bg-black/65 backdrop-blur-md text-[11px] font-medium text-white px-2.5 py-1 rounded-md border border-white/10 shadow-xs pointer-events-none flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#8FAF72]" />
                        <span>Album • {cardImages.length}</span>
                      </span>
                    )}

                    {/* Card Carousel Controls if Album */}
                    {cardImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleCardPrevImage(e, photo)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-25 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20 shadow-sm"
                          title="Previous image"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCardNextImage(e, photo)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-25 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20 shadow-sm"
                          title="Next image"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Carousel Dots */}
                        <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-1 bg-black/55 backdrop-blur-xs px-2 py-1 rounded-full pointer-events-none">
                          {cardImages.slice(0, 5).map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`h-1.5 rounded-full transition-all ${
                                cardImgIndex === dotIdx ? "bg-white w-3" : "bg-white/50 w-1.5"
                              }`}
                            />
                          ))}
                          {cardImages.length > 5 && (
                            <span className="text-[9px] text-white/80 font-mono pl-0.5">
                              +{cardImages.length - 5}
                            </span>
                          )}
                        </div>
                      </>
                    )}

                    {/* Quick Share Sublink Button */}
                    <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ShareButton
                        section="gallery"
                        query={{ photo: photo.id }}
                        title={photo.title}
                        variant="icon"
                        className="bg-black/60 hover:bg-black/80 text-white rounded-md border border-white/20 p-1.5 shadow-md"
                        onToast={onToast}
                      />
                    </div>

                    {/* Subtle Copyright Watermark */}
                    <div className="absolute bottom-3 right-3 z-20 opacity-70 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-mono tracking-wider text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded pointer-events-none">
                      © Rafiul
                    </div>
                  </div>

                  {/* Caption & Metadata Card */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-[#172117] group-hover:text-[#2F5D3A] transition-colors line-clamp-1">
                          {photo.title}
                        </h3>
                      </div>
                      {photo.caption && (
                        <p className="text-xs sm:text-sm text-[#4E5E4E] line-clamp-2 leading-relaxed">
                          {photo.caption}
                        </p>
                      )}
                    </div>

                    {/* Tags Preview */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {photo.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center text-[10px] bg-[#F4F1E6] text-[#4E5E4E] border border-[#8FAF72]/30 font-medium px-2 py-0.5 rounded"
                          >
                            #{tag.replace(/^#/, "")}
                          </span>
                        ))}
                        {photo.tags.length > 3 && (
                          <span className="text-[10px] text-[#4E5E4E] self-center">
                            +{photo.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom Meta Info: Location & Date */}
                    <div className="pt-2 border-t border-[#8FAF72]/30 flex items-center justify-between text-[11px] text-[#4E5E4E]">
                      {photo.location ? (
                        <span className="inline-flex items-center space-x-1 truncate max-w-[65%]">
                          <MapPin className="w-3 h-3 text-[#467A4A] shrink-0" />
                          <span className="truncate">{photo.location}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[#4E5E4E]">
                          <Sparkles className="w-3 h-3 text-[#467A4A]" />
                          <span>Original Shot</span>
                        </span>
                      )}

                      {photo.date && (
                        <span className="inline-flex items-center space-x-1 shrink-0">
                          <Calendar className="w-3 h-3 text-[#467A4A]" />
                          <span>{photo.date}</span>
                        </span>
                      )}
                    </div>

                    {/* Facebook Reactions & Interaction Bar */}
                    <div className="pt-2.5 border-t border-[#8FAF72]/30" onClick={(e) => e.stopPropagation()}>
                      <FacebookReactions
                        photoId={photo.id}
                        summary={reactionsMap[photo.id]}
                        commentCount={commentsMap[photo.id]?.length || 0}
                        variant="card"
                        onToast={onToast}
                        onOpenComments={() => {
                          setExpandedCommentsPhotoId(
                            expandedCommentsPhotoId === photo.id ? null : photo.id
                          );
                        }}
                      />
                    </div>

                    {/* Expandable Inline Comments on Card */}
                    <AnimatePresence>
                      {expandedCommentsPhotoId === photo.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="pt-3 border-t border-[#8FAF72]/30 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PhotoCommentsSection
                            photoId={photo.id}
                            comments={commentsMap[photo.id] || []}
                            variant="inline"
                            onToast={onToast}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* LIGHTBOX MODAL WITH ANTI-DOWNLOAD SHIELD */}
      <AnimatePresence>
        {activeLightboxIndex !== null && filteredPhotos[activeLightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none"
            onClick={closeLightbox}
            onContextMenu={handlePreventDefault}
          >
            {/* Top Bar Actions */}
            <div className="absolute top-5 right-5 z-50 flex items-center space-x-2">
              <ShareButton
                section="gallery"
                query={{ photo: filteredPhotos[activeLightboxIndex].id }}
                title={filteredPhotos[activeLightboxIndex].title}
                label="Copy Direct Link"
                variant="darkPill"
                onToast={onToast}
              />
              <button
                onClick={closeLightbox}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Preview (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Prev Post */}
            {filteredPhotos.length > 1 && (
              <button
                onClick={prevPost}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Previous Post / Album"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Navigation Next Post */}
            {filteredPhotos.length > 1 && (
              <button
                onClick={nextPost}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Next Post / Album"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Lightbox Content Container */}
            {(() => {
              const activePhoto = filteredPhotos[activeLightboxIndex];
              const albumImages =
                activePhoto.images && activePhoto.images.length > 0
                  ? activePhoto.images
                  : [activePhoto.image];
              const currentImg = albumImages[activeAlbumImageIndex] || activePhoto.image;

              return (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-6xl w-full h-[92vh] max-h-[920px] flex flex-col lg:flex-row bg-[#1F452B] border border-[#8FAF72]/30 rounded-2xl overflow-hidden shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                  onContextMenu={handlePreventDefault}
                >
                  {/* Left Column: Image Preview Theatre with Complete Anti-Save Shield */}
                  <div className="relative flex-1 lg:max-w-[62%] xl:max-w-[65%] bg-black min-h-[260px] h-[38vh] sm:h-[45vh] lg:h-full flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={currentImg}
                      alt={activePhoto.title}
                      onContextMenu={handlePreventDefault}
                      onDragStart={handlePreventDefault}
                      draggable={false}
                      className="h-full w-full object-contain pointer-events-none select-none transition-opacity duration-200"
                      referrerPolicy="no-referrer"
                      style={{
                        WebkitUserSelect: "none",
                        userSelect: "none",
                      }}
                    />

                    {/* Album Photo Counter Badge */}
                    {albumImages.length > 1 && (
                      <div className="absolute top-4 left-4 z-30 bg-[#173522]/85 backdrop-blur-md px-3 py-1 rounded-full text-xs text-[#F4F1E6] flex items-center space-x-1.5 border border-[#8FAF72]/30 shadow-md">
                        <Layers className="w-3.5 h-3.5 text-[#8FAF72]" />
                        <span>
                          Photo {activeAlbumImageIndex + 1} of {albumImages.length}
                        </span>
                      </div>
                    )}

                    {/* Inner Navigation Arrows for Album Photos */}
                    {albumImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={prevAlbumImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors cursor-pointer border border-white/20 shadow-md"
                          title="Previous photo in album"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={nextAlbumImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors cursor-pointer border border-white/20 shadow-md"
                          title="Next photo in album"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Thumbnail Carousel Strip */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 max-w-[90%] overflow-x-auto p-1.5 bg-[#173522]/85 backdrop-blur-md rounded-xl border border-[#8FAF72]/30">
                          {albumImages.map((imgUrl, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAlbumImageIndex(aIdx);
                              }}
                              className={`w-12 h-9 rounded-md overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${
                                activeAlbumImageIndex === aIdx
                                  ? "border-[#8FAF72] ring-2 ring-[#2F5D3A]/60 scale-105"
                                  : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Thumb ${aIdx + 1}`}
                                className="w-full h-full object-cover pointer-events-none select-none"
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Protective Click Shield (disables inspect/save/drag) */}
                    <div
                      className="absolute inset-0 z-20 bg-transparent select-none"
                      onContextMenu={handlePreventDefault}
                      onDragStart={handlePreventDefault}
                    />

                    {/* Watermark Overlay in Lightbox */}
                    <div className="absolute bottom-4 right-4 z-30 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-[11px] text-[#F4F1E6] font-mono border border-white/10 pointer-events-none">
                      © Md. Rafiul Islam • Photography
                    </div>
                  </div>

                  {/* Right Column: Author Header, Details, Facebook Reactions & Full Comments Feed */}
                  <div className="lg:w-[38%] xl:w-[35%] flex flex-col bg-[#1F452B] text-[#F4F1E6] border-t lg:border-t-0 lg:border-l border-[#8FAF72]/20 h-[54vh] sm:h-[47vh] lg:h-full overflow-hidden">
                    {/* Top Author Bar */}
                    <div className="p-3.5 sm:p-4 border-b border-[#8FAF72]/20 flex items-center justify-between shrink-0 bg-[#173522]">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F5D3A] to-[#467A4A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          RI
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
                            Md. Rafiul Islam
                          </h4>
                          <p className="text-[10px] text-[#8FAF72] truncate">
                            Photography Portfolio
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-[#F4F1E6] font-mono bg-white/5 px-2 py-0.5 rounded border border-[#8FAF72]/20">
                          {activeLightboxIndex + 1} / {filteredPhotos.length}
                        </span>
                        <button
                          type="button"
                          onClick={closeLightbox}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#8FAF72] hover:text-white transition-colors cursor-pointer"
                          title="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
                      {/* Photo Title & Category */}
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          {activePhoto.category && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-[#F4F1E6] font-medium">
                              {activePhoto.category}
                            </span>
                          )}
                          {albumImages.length > 1 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#2F5D3A]/40 text-[#F4F1E6] border border-[#8FAF72]/30 font-medium flex items-center space-x-1">
                              <Layers className="w-3 h-3 text-[#8FAF72]" />
                              <span>Album ({albumImages.length})</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
                          {activePhoto.title}
                        </h3>
                      </div>

                      {/* Caption */}
                      {activePhoto.caption && (
                        <p className="text-xs sm:text-sm text-[#F4F1E6]/90 leading-relaxed whitespace-pre-line">
                          {activePhoto.caption}
                        </p>
                      )}

                      {/* Tags in Lightbox */}
                      {activePhoto.tags && activePhoto.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {activePhoto.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center space-x-1 text-[11px] bg-white/5 text-[#8FAF72] px-2 py-0.5 rounded-md border border-[#8FAF72]/20"
                            >
                              <Tag className="w-2.5 h-2.5 opacity-75 text-[#8FAF72]" />
                              <span>#{tag.replace(/^#/, "")}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Location & Date */}
                      {(activePhoto.location || activePhoto.date) && (
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#8FAF72]/90 pt-0.5">
                          {activePhoto.location && (
                            <span className="inline-flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-[#8FAF72] shrink-0" />
                              <span className="truncate max-w-[200px]">{activePhoto.location}</span>
                            </span>
                          )}
                          {activePhoto.date && (
                            <span className="inline-flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5 text-[#8FAF72] shrink-0" />
                              <span>{activePhoto.date}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Facebook Reactions in Lightbox */}
                      <div className="pt-3 border-t border-[#8FAF72]/20" onClick={(e) => e.stopPropagation()}>
                        <FacebookReactions
                          photoId={activePhoto.id}
                          summary={reactionsMap[activePhoto.id]}
                          commentCount={commentsMap[activePhoto.id]?.length || 0}
                          variant="lightbox"
                          onToast={onToast}
                          onOpenComments={() => {
                            const el = document.getElementById(`lightbox-comments-${activePhoto.id}`);
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                        />
                      </div>

                      {/* Comments Section in Lightbox */}
                      <div
                        id={`lightbox-comments-${activePhoto.id}`}
                        className="pt-3 border-t border-[#8FAF72]/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PhotoCommentsSection
                          photoId={activePhoto.id}
                          comments={commentsMap[activePhoto.id] || []}
                          variant="lightbox"
                          onToast={onToast}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
