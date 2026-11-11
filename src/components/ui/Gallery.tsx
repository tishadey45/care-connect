
import Image from "next/image";

const galleryImages = [
  {
    id: 1,
    title: "Tree Plantation",
    category: "Environment",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=85",
  },
  {
    id: 2,
    title: "Blood Donation",
    category: "Healthcare",
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=85",
  },
  {
    id: 3,
    title: "Food Distribution",
    category: "Charity",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=85",
  },
  {
    id: 4,
    title: "Community Cleaning",
    category: "Environment",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=85",
  },
  {
    id: 5,
    title: "Helping Children",
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=85",
  },
  {
    id: 6,
    title: "Community Volunteers",
    category: "Social Work",
    image:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=85",
  },
];

export default function Gallery() {
  return (
    <section className="bg-[#F3F8F1] px-5 py-16 md:py-24">

      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">

          <span className="mb-3 inline-block rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            📸 Our Memories
          </span>

          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Moments That
            <span className="text-green-700"> Make a Difference</span>
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            Explore the beautiful moments of kindness, teamwork,
            and community service through our gallery.
          </p>

        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {galleryImages.map((item) => (
            <div
              key={item.id}
              className="group relative h-72 overflow-hidden rounded-2xl shadow-md"
            >

              {/* Gallery Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-110"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-90" />

              {/* Image Information */}
              <div className="absolute right-0 bottom-0 left-0 p-6 text-white">

                <span className="mb-2 inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-semibold">
                  {item.category}
                </span>

                <h3 className="text-xl font-bold">
                  {item.title}
                </h3>

              </div>

            </div>
          ))}

        </div>

        {/* Bottom Message */}
        <div className="mt-12 text-center">
          <p className="text-sm font-medium text-green-800">
            ❤️ Together, We Create Memories and Change Lives.
          </p>
        </div>

      </div>

    </section>
  );
}
