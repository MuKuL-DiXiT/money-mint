import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebaseConfig";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [user] = useAuthState(auth);
  const sectionRefs = useRef([]);
  sectionRefs.current = [];

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  useEffect(() => {
    sectionRefs.current.forEach((el, index) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      if (index === 0) {
        gsap.fromTo(el.querySelector("h1"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.3 });
        gsap.fromTo(el.querySelector("p"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.5 });
        gsap.fromTo(el.querySelector("a"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.7 });
      } else if (index === 1) {
        gsap.fromTo(el.querySelector("h2"), { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2, scrollTrigger: { trigger: el.querySelector("h2"), start: "top 85%" } });
        gsap.fromTo(el.querySelectorAll(".feature-card"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.2, delay: 0.4, scrollTrigger: { trigger: el.querySelector(".feature-card"), start: "top 90%" } });
      } else if (index === 2) {
        gsap.fromTo(el.querySelector("h2"), { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2, scrollTrigger: { trigger: el.querySelector("h2"), start: "top 85%" } });
        gsap.fromTo(el.querySelector("p"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.4, scrollTrigger: { trigger: el.querySelector("p"), start: "top 85%" } });
        gsap.fromTo(el.querySelectorAll(".cta-button"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", stagger: 0.15, delay: 0.6, scrollTrigger: { trigger: el.querySelector(".cta-button"), start: "top 90%" } });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="text-white font-inter relative">
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-800/20 via-teal-900/30 to-purple-800/20 animate-backgroundBlur z-0"></div>

      {/* SECTION 1 */}
      <section ref={addToRefs} className="min-h-screen flex flex-col justify-center items-center px-6 py-16 text-center relative z-10 overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900">
        <style>{`
          @keyframes move-pattern {
            from { background-position: 0 0; }
            to { background-position: 600px 600px; }
          }
          .text-shine-on-hover {
            transition: text-shadow 0.3s ease-out, transform 0.3s ease-out;
          }
          .text-shine-on-hover:hover {
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.7), 0 0 15px rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
          }
          .animate-backgroundBlur {
            animation: move-pattern 60s linear infinite;
          }
        `}</style>
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-cyan-300 to-teal-100 text-transparent bg-clip-text animate-pulse">
          Welcome to MoneyMint 💸
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mb-8 leading-relaxed">
          Not just a finance tracker. MoneyMint lets you analyze your <strong className="text-orange-700 text-shine-on-hover">mindset-based</strong> spending — categorize by <strong className="text-purple-700 text-shine-on-hover">useful</strong>, <strong className="text-yellow-700 text-shine-on-hover">impulse</strong>, <strong className="text-blue-400 hover:text-blue-700 text-shine-on-hover">important</strong>, or <strong className="text-red-600 text-shine-on-hover">useless</strong>.
        </p>
        <NavLink
          to={user ? "/dashboard" : "/login"}
          className="text-white bg-black/40 px-8 py-4 rounded-full shadow-2xl hover:shadow-white text-shine-on-hover hover:scale-105  transition-all duration-300 font-bold text-lg animate-pulse"
          style={{ boxShadow: '0 0 20px 5px rgba(255,255,255,0.5)' }}

        >
          {user ? "Go to Dashboard" : "Get Started"}
        </NavLink>
      </section> 

      {/* SECTION 2 */}
      <section ref={addToRefs} className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-700 to-blue-900 px-6 py-16 text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl  font-extrabold mb-16 bg-gradient-to-r from-white via-cyan-300 to-teal-100 text-transparent bg-clip-text animate-pulse">
          ✨ Explore Money Mint
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          <FeatureCard title="📊 Dashboard" desc="View all your expenses categorized and color-coded by mindset, with insightful analytics." link="/dashboard" />
          <FeatureCard title="➕ Add Entry" desc="Effortlessly add new spending entries, assign tags like useful or impulse, and save them instantly." link="/add" />
          <FeatureCard title="🧠 Smart Plan" desc="Let AI generate a balanced spending plan for the next month based on your unique habits and goals." link="/plan" />
        </div>
      </section>

      {/* SECTION 3 */}
      <section ref={addToRefs} className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-fuchsia-900 px-6 py-16 text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-cyan-300 to-teal-100 text-transparent bg-clip-text animate-pulse">
          🔓 Ready to take control?
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
          Login and start categorizing your money the smart way. Unlock financial clarity and achieve your goals. 💡
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {!user && <Link to="/login" className="cta-button bg-white text-purple-800 px-8 py-4 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-100 transition-all duration-300 font-bold text-lg">
            Login
          </Link>}
          <Link to="/dashboard" className="cta-button bg-white text-purple-800 px-8 py-4 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-100 transition-all duration-300 font-bold text-lg">
            Dashboard
          </Link>
          <Link to="/add" className="cta-button bg-white text-purple-800 px-8 py-4 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-100 transition-all duration-300 font-bold text-lg">
            Add Entry
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc, link }) {
  return (
    <Link
      to={link}
      className="feature-card bg-white/30 hover:bg-white animate-bounce  text-gray-900 rounded-2xl shadow-xl p-8 transform hover:scale-105 hover:shadow-2xl transition-all duration-1000 max-w-xs mx-auto flex flex-col items-center justify-center text-center border-b-4 border-cyan-500 hover:border-blue-700"
    >
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-base text-gray-700">{desc}</p>
    </Link>
  );
}
