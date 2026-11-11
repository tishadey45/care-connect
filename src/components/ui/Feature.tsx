const features = [
  {
    id: 1,
    icon: "📅",
    title: "Create Events",
    description:
      "Create and organize social development events to bring positive changes to your community.",
  },
  {
    id: 2,
    icon: "🤝",
    title: "Join Events",
    description:
      "Discover upcoming events and participate in meaningful community service activities.",
  },
  {
    id: 3,
    icon: "❤️",
    title: "Volunteer Together",
    description:
      "Connect with passionate volunteers and work together to make a positive impact.",
  },
  {
    id: 4,
    icon: "🌍",
    title: "Build Community",
    description:
      "Build stronger communities through teamwork, kindness, and social responsibility.",
  },
];

export default function Feature() {
  return (
    <section className="bg-white px-5 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            ✨ What We Offer
          </span>

          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Everything You Need to
            <span className="text-green-700"> Make an Impact</span>
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Discover the opportunities to connect, collaborate, and create
            meaningful changes with careConnect.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group rounded-2xl border border-green-100 bg-[#F8FBF7] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-green-300 hover:shadow-xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl transition duration-300 group-hover:bg-green-700 group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className="mb-3 text-xl font-bold text-gray-900 transition group-hover:text-green-700">
                {feature.title}
              </h3>

              <p className="text-sm leading-7 text-gray-600">
                {feature.description}
              </p>

              <div className="mt-6 h-1 w-12 rounded-full bg-green-600 transition-all duration-300 group-hover:w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
