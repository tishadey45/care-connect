export default function Newsletter() {
  return (
    <section className="bg-green-950 text-white py-16 px-5">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-yellow-400 font-semibold uppercase tracking-widest mb-3">
          Stay Connected With CareConnect
        </p>

        <h2 className="text-3xl md:text-4xl font-bold mb-5">
          Be a Part of Something Meaningful!
        </h2>

        <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Stay updated with the latest community events, volunteer
          opportunities, and inspiring stories. Together, we can create a better
          tomorrow.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="input input-bordered w-full text-gray-800 bg-white"
          />

          <button
            type="button"
            className="btn bg-yellow-500 hover:bg-yellow-400 border-none text-green-950 font-bold px-8"
          >
            Subscribe
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-6">
          Join CareConnect and make a difference in your community.
        </p>
      </div>
    </section>
  );
}
