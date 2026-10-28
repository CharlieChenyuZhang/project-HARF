// "Students studying in a grand, dimly lit library hall" by Ashutosh Gupta,
// free under the Unsplash License: https://unsplash.com/photos/dsQKzZEwSQY
const PHOTO = "https://images.unsplash.com/photo-1778735940457-772f588a0dd3?auto=format&fit=crop&q=70";

export const HERO_PHOTO_CREDIT = {
  name: "Ashutosh Gupta",
  url: "https://unsplash.com/photos/dsQKzZEwSQY",
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
        className="size-full object-cover object-[60%_center]"
      />
      <div className="absolute inset-0 bg-navy/80 md:bg-transparent md:bg-gradient-to-r md:from-navy/95 md:via-navy/75 md:to-navy/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" />
    </div>
  );
}
