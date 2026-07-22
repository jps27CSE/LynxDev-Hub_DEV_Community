import Image from "next/image";
import Link from "next/link";

const videos = [
  {
    title: "Getting Started with Web Development",
    thumbnail: "https://img.youtube.com/vi/placeholder1/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder1",
  },
  {
    title: "React Tutorial for Beginners",
    thumbnail: "https://img.youtube.com/vi/placeholder2/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder2",
  },
  {
    title: "JavaScript Fundamentals",
    thumbnail: "https://img.youtube.com/vi/placeholder3/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder3",
  },
  {
    title: "CSS Grid & Flexbox Masterclass",
    thumbnail: "https://img.youtube.com/vi/placeholder4/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder4",
  },
  {
    title: "Node.js Crash Course",
    thumbnail: "https://img.youtube.com/vi/placeholder5/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder5",
  },
  {
    title: "Python for Beginners",
    thumbnail: "https://img.youtube.com/vi/placeholder6/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder6",
  },
];

function YoutubeCarousel() {
  return (
    <section className="py-20 sm:py-28 border-b border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Watch & Learn
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Curated video tutorials from our YouTube channel
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="flex gap-4 animate-scroll w-max">
          {[...videos, ...videos].map((video, index) => (
            <Link
              key={index}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[280px] group"
            >
              <div className="rounded-xl overflow-hidden border border-border/50 group-hover:border-border transition-colors bg-card">
                <div className="aspect-video relative bg-muted">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default YoutubeCarousel;
