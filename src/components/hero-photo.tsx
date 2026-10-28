// "Antique printing press trays filled with metal type" by Fabian Kleiser,
// free under the Unsplash License: https://unsplash.com/photos/Sxs2E3QYoJ4
// Movable type: the last time a technology changed how people think and write.
const PHOTO = "https://images.unsplash.com/photo-1777621543796-f6c62717d932?auto=format&fit=crop&q=70";

export const HERO_PHOTO_CREDIT = {
  name: "Fabian Kleiser",
  url: "https://unsplash.com/photos/Sxs2E3QYoJ4",
};

/** Full-bleed photo with a navy wash, darker on the side the text sits on. */
export function HeroPhoto() {
  return (
    <div aria-hidden className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: images are served unoptimized */}
      <img
        src={`${PHOTO}&w=1600`}
        srcSet={`${PHOTO}&w=800 800w, ${PHOTO}&w=1600 1600w, ${PHOTO}&w=2400 2400w`}
        sizes="100vw"
        alt=""
        fetchPriority="high"
        className="size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-navy/65 md:bg-transparent md:bg-gradient-to-r md:from-navy/90 md:via-navy/50 md:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
    </div>
  );
}
