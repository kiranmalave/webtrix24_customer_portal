import Webtrix24LogoAnimated from "../pages/Webtrix24LogoAnimated";

// Left-panel decorative slides (static fallback, can be replaced by API data)
const DEFAULT_SLIDES = [
  {
    title: 'Streamline Your Business',
    description: 'Manage leads, customers, and tasks in one unified platform. Automate repetitive workflows and save hours every week.',
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Keep your entire team aligned with shared pipelines, activity feeds, and instant notifications across every device.',
  },
  {
    title: 'Data-Driven Decisions',
    description: "Beautiful dashboards and reports give you instant visibility into what's working — and what needs attention.",
  },
];

export default function LeftPanel() {
  return (
    <div className="relative hidden md:flex flex-col justify-center items-center p-12 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-500 to-orange-200">
      {/* Decorative circles */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-white/5 -top-[100px] -left-[100px]" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 -bottom-[80px] -right-[80px]" />

      <div className="relative z-10 text-center text-white max-w-[450px]">
        <div className="text-3xl font-bold text-white mb-2">
          <Webtrix24LogoAnimated
            className="w-[200px] justify-center mx-auto mb-4"
            webtrixProps={{
              whileHover: { scale: 1.04 },
              transition: { duration: 0.7, type: "spring", stiffness: 200 }
            }}
            twentyFourProps={{
              whileHover: { scale: 1.09, rotate: 2 },
              transition: { duration: 0.6, type: "spring", stiffness: 240, delay: 0.6 }
            }}
          />
        </div>
        <h2 className="text-[1.75rem] font-bold mb-4 leading-snug">
          Grow Faster with the Right CRM
        </h2>
        <p className="text-[0.95rem] opacity-85 leading-[1.7] mb-8">
          Join thousands of businesses using Webtrix24 to manage customers,
          automate workflows, and close more deals — all in one place.
        </p>
        <ul className="list-none text-left">
          {DEFAULT_SLIDES.map((s, i) => (
            <li key={i} className="flex items-center gap-3 py-2 text-sm opacity-90">
              <span className="text-emerald-300 text-base shrink-0">✔</span>
              <span>{s.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
