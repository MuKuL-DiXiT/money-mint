import { useEffect, useState, useRef } from "react";
import { collection, query, where, deleteDoc, getDocs, doc, Timestamp } from "firebase/firestore"; // Import Timestamp
import { db, auth } from "../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { Tag } from 'lucide-react';
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";

// Stable color scheme - subtle colors
const purposeColors = {
  useful: "bg-emerald-50 text-emerald-700 border-emerald-200",
  important: "bg-amber-50 text-amber-700 border-amber-200",
  useless: "bg-slate-50 text-slate-600 border-slate-200",
  impulse: "bg-rose-50 text-rose-700 border-rose-200",
};

const pieColors = {
  useful: "#059669",
  important: "#d97706",
  useless: "#475569",
  impulse: "#dc2626",
};

// Simple pie chart component



export default function Dashboard({ dark }) {
  const SimplePieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    if (total === 0) {
      return (
        <div className="w-full max-w-lg mx-auto text-center text-gray-400 py-16">
          <p>No spending data for the selected time period.</p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg width="256" height="256" viewBox="0 0 256 256" className="transform -rotate-90">
            {data.length === 1 ? (
              <circle
                cx="128"
                cy="128"
                r="100"
                fill={pieColors[data[0].name] || "#ccc"}
              />
            ) : (
              data.map((item, index) => {
                const percentage = item.value / total;
                const angle = percentage * 360;
                const startAngle = currentAngle;
                currentAngle += angle;

                const startX = 128 + 100 * Math.cos((startAngle * Math.PI) / 180);
                const startY = 128 + 100 * Math.sin((startAngle * Math.PI) / 180);
                const endX = 128 + 100 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                const endY = 128 + 100 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                  `M 128 128`,
                  `L ${startX} ${startY}`,
                  `A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  `Z`,
                ].join(" ");

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={pieColors[item.name] || "#ccc"}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="w-full">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: pieColors[item.name] || "#ccc" }}
                ></div>
                <span className="text-gray-700 font-medium">
                  {item.name} (₹{item.value.toLocaleString()})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const [user] = useAuthState(auth);
  const [allEntries, setAllEntries] = useState([]); // Stores all entries fetched based on timeFilter
  const [purposeFilter, setPurposeFilter] = useState("all"); // Renamed 'filter' to 'purposeFilter'
  const [timeFilter, setTimeFilter] = useState("allTime");
  const [isLoading, setIsLoading] = useState(true);

  const chartRef = useRef(null);
  const entriesRef = useRef(null);
  const headerRef = useRef(null);
  const purposeFiltersRef = useRef(null); // Renamed ref
  const timeFiltersRef = useRef(null);

  // Data for the entries grid (time filtered + purpose filtered)
  const displayedEntries = purposeFilter === "all" ? allEntries : allEntries.filter((entry) => entry.purpose === purposeFilter);

  // Data for the pie chart (only time filtered)
  const chartDataEntries = allEntries; // Pie chart uses only time-filtered data from `allEntries`

  useEffect(() => {
    if (!user?.uid) return;

    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        let qRef = collection(db, "entries");
        let startDate = null;

        const now = new Date(); // Client's current local time
        // Get the start of today in UTC for consistent calculations
        const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        switch (timeFilter) {
          case "lastDay":
            // Entries from the beginning of today (UTC)
            startDate = Timestamp.fromDate(todayUTC);
            break;
          case "last7days":
            // Entries from the beginning of 7 days ago (UTC)
            const sevenDaysAgoUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 7));
            startDate = Timestamp.fromDate(sevenDaysAgoUTC);
            break;
          case "lastMonth":
            // Entries from the first day of the current month (UTC)
            const firstDayOfMonthUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
            startDate = Timestamp.fromDate(firstDayOfMonthUTC);
            break;
          case "allTime":
          default:
            startDate = null; // No date filter for allTime
            break;
        }

        let conditions = [where("userId", "==", user.uid)];
        if (startDate) {
          conditions.push(where("createdAt", ">=", startDate));
        }

        const q = query(qRef, ...conditions);

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllEntries(data); // Store all time-filtered entries here
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [user, timeFilter]); // Re-fetch when user or timeFilter changes

  // GSAP animations for initial load
  useEffect(() => {
    if (!isLoading) {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 1, ease: "power4.out" }
        );
      }

      if (chartRef.current) {
        gsap.fromTo(chartRef.current,
          { opacity: 0, scale: 0.8, transformOrigin: "center center" },
          { opacity: 1, scale: 1, duration: 1.2, ease: "expo.out", delay: 0.3 }
        );
      }

      if (purposeFiltersRef.current && timeFiltersRef.current) {
        const allButtons = [
          ...Array.from(purposeFiltersRef.current.children),
          ...Array.from(timeFiltersRef.current.children),
        ];
        gsap.fromTo(allButtons,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 1,
            ease: "power3.out",
            delay: 0.5
          }
        );
      }

      if (entriesRef.current) {
        gsap.fromTo(entriesRef.current.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 1,
            ease: "power3.out",
            delay: 0.6
          }
        );
      }
    }
  }, [isLoading]);

  useEffect(() => {
    if (entriesRef.current && !isLoading) {
      gsap.fromTo(entriesRef.current.children,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out"
        }
      );
    }
  }, [purposeFilter, timeFilter, isLoading]);

  useEffect(() => {
    if (chartRef.current && !isLoading) {
      const svg = chartRef.current.querySelector("svg");

      if (svg) {
        gsap.fromTo(svg,
          { opacity: 0, y: 100, scale: 0.7 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 2,
            ease: "back.out(4)", // more dramatic bounce effect
          }
        );
      }
    }
  }, [timeFilter, isLoading]);

  // Only depends on timeFilter for chart animation

  const handleDelete = async (id) => {
    const element = document.getElementById(`entry-${id}`);
    if (element) {
      gsap.to(element, {
        opacity: 0,
        x: -50,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.3,
        onComplete: async () => {
          await deleteDoc(doc(db, "entries", id));
          // Update allEntries directly after deletion
          setAllEntries(prevEntries => prevEntries.filter((entry) => entry.id !== id));
        },
      });
    } else {
      await deleteDoc(doc(db, "entries", id));
      setAllEntries(prevEntries => prevEntries.filter((entry) => entry.id !== id));
    }
  };

  // Calculate purpose summary for the chart based on chartDataEntries
  const purposeSummaryForChart = chartDataEntries.reduce((acc, entry) => {
    acc[entry.purpose] = (acc[entry.purpose] || 0) + entry.amount;
    return acc;
  }, {});

  const pieData = Object.entries(purposeSummaryForChart).map(([key, value]) => ({
    name: key,
    value,
  }));

  const getTotalSpending = () => {
    return displayedEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-800 text-lg font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${(dark) ? "from-teal-900 to-black" : "from-white to-yellow-200"} pb-20 md:pb-0`}>
      <style>{`
        .text-shine-on-hover {
            transition: text-shadow 0.3s ease-out, transform 0.3s ease-out;
          }
          .text-shine-on-hover:hover {
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.7), 0 0 15px rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
          }
      `}</style>
      {/* Header */}
      <div ref={headerRef} className="bg-white/60 mx-16 rounded-b-lg shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-teal-800 font-sans text-center">
            💸 Spending Dashboard
          </h1>
          {/* Show total spending */}
          <div className="text-center mt-2">
            <p className="text-lg text-gray-600">
              Total Spending: <span className="font-bold text-teal-700">₹{getTotalSpending().toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-500">
              {displayedEntries.length} {displayedEntries.length === 1 ? 'entry' : 'entries'}
              {purposeFilter !== 'all' && ` • ${purposeFilter} purchases`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Filters */}
        <div className="flex flex-col  justify-center sm:justify-between items-center">
          <div ref={timeFiltersRef} className="flex justify-center mb-8 gap-2 sm:gap-4 flex-wrap px-4">
            {["allTime", "lastDay", "last7days", "lastMonth"].map((timeTag) => (
              <button
                key={timeTag}
                onClick={() => setTimeFilter(timeTag)}
                className={`px-4 py-2 rounded-full border-2 font-semibold transition-all duration-300 transform hover:scale-105 ${timeFilter === timeTag
                  ? "bg-teal-600 text-white border-teal-600 shadow-lg"
                  : "bg-white text-teal-600 border-teal-300 hover:bg-teal-50"
                  }`}
              >
                {timeTag === "allTime" ? "All Time" : timeTag === "lastDay" ? "Last Day" : timeTag === "last7days" ? "Last 7 Days" : "Last Month"}
              </button>
            ))}
          </div>
          <NavLink to='/add' className={`text-black text-center px-16  py-2 bordrer-2 animate-pulse shadow-lg text-shine-on-hover shadow-black mb-8 rounded-full ${dark ? "bg-yellow-500 border-yellow-500" : "bg-red-700 border-red-700"}`}>Add Spendings + </NavLink>
        </div>


        {/* Chart Section */}
        <div
          ref={chartRef}
          className={`${(dark) ? "bg-black/40" : "bg-white"} rounded-2xl shadow-xl p-6 sm:p-8 mb-8`}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-teal-800 text-center mb-6">
            🧮 Spending Breakdown
          </h2>
          <div className="flex justify-center">
            {/* Pass pieData calculated from time-filtered entries only */}


            <SimplePieChart data={pieData} />
          </div>
        </div>

        {/* Purpose Filters */}

        <div ref={purposeFiltersRef} className="flex justify-center mb-8 gap-2 sm:gap-4 flex-wrap px-4">
          {["all", "useful", "important", "useless", "impulse"].map((tag) => (
            <button
              key={tag}
              onClick={() => setPurposeFilter(tag)}
              className={`px-4 py-2 rounded-full border-2 font-semibold transition-all duration-300 transform hover:scale-105 ${purposeFilter === tag // Changed state variable
                ? "bg-teal-600 text-white border-teal-600 shadow-lg"
                : "bg-white text-teal-600 border-teal-300 hover:bg-teal-50"
                }`}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
        {/* Entries Grid */}
        {displayedEntries.length === 0 ? ( // Check displayedEntries for empty state
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">
              No {purposeFilter !== 'all' ? `${purposeFilter} ` : ''}entries found for this period.
            </p>
          </div>
        ) : (
          <div
            ref={entriesRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {displayedEntries.map((entry) => (
              <div
                key={entry.id}
                id={`entry-${entry.id}`}
                className="bg-teal-950 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      ₹{entry.amount.toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 bg-red-900 bg-opacity-30 hover:bg-opacity-50 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-200 font-medium flex items-center gap-2">
                      <span className="text-lg">📦</span>
                      <span className="text-sm sm:text-base">{entry.category}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm italic">{entry.tag}</span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${purposeColors[entry.purpose] || "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                    >
                      {entry.purpose.charAt(0).toUpperCase() + entry.purpose.slice(1)}
                    </span>
                    {/* Display date if createdAt exists and is a Timestamp */}
                    {entry.createdAt && entry.createdAt.toDate && (
                      <span className="text-gray-400 text-xs">
                        {entry.createdAt.toDate().toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
