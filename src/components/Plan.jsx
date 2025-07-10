import React, { useState, useEffect, useCallback, useRef } from "react"; // Import useRef
import { db, auth } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Brain, Save, Plus, Trash2 } from 'lucide-react';
import { gsap } from "gsap"; // Import GSAP
import { NavLink } from "react-router-dom";

export default function CreatePlan() {
  const [user] = useAuthState(auth);
  const [entries, setEntries] = useState([]);
  const [timePeriod, setTimePeriod] = useState("Monthly");
  const [budget, setBudget] = useState("");
  const [categories, setCategories] = useState("");

  const [aiPlan, setAiPlan] = useState(null);
  const [manualPlan, setManualPlan] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  // Refs for GSAP animations
  const planContainerRef = useRef(null);
  const aiSectionRef = useRef(null);
  const manualSectionRef = useRef(null);
  const aiPlanResultsRef = useRef(null);
  const manualPlanResultsRef = useRef(null);
  const planbutton = useRef(null);


  // Secure fetch mock (assuming it's available globally or imported from a utility file)
  async function secureFetch(path, options = {}) {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const url = `${baseUrl}${path}`;
    let res = await fetch(url, { ...options, credentials: "include" });
    if (res.status === 401) {
      const refresh = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refresh.ok) return fetch(url, { ...options, credentials: "include" });
      await fetch(`${baseUrl}/auth/logout`, { method: "GET", credentials: "include" });
      throw new Error("Session expired. Logged out.");
    }
    return res;
  }

  // Fetch spending entries from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchEntries = async () => {
      try {
        const q = query(collection(db, "entries"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => doc.data());
        setEntries(data);
      } catch (err) {
        console.error("Error fetching spending entries:", err);
        toast.error("Failed to load spending history.");
      }
    };
    fetchEntries();
  }, [user]);

  // GSAP animation for initial load of sections
  useEffect(() => {
    if (planContainerRef.current) {
      gsap.fromTo(planContainerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(5)", delay: 0.2 }
      );
    }
    if (aiSectionRef.current) {
      gsap.fromTo(aiSectionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "back.out(5)", delay: 0.4 }
      );
    }
    if (manualSectionRef.current) {
      gsap.fromTo(manualSectionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "back.out(5)", delay: 0.6 }
      );
    }
    if (planbutton.current) {
      gsap.fromTo(planbutton.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "back.out(5)", delay: 0.6 }
      );
    }
  }, []); // Empty dependency array means this runs once on mount

  // GSAP animation for AI Plan results when they appear
  useEffect(() => {
    if (aiPlan && aiPlanResultsRef.current) {
      gsap.fromTo(aiPlanResultsRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: "back.out(5)" }
      );
    }
  }, [aiPlan]);

  // GSAP animation for Manual Plan results when they change
  useEffect(() => {
    if (manualPlan.length > 0 && manualPlanResultsRef.current) {
      gsap.fromTo(manualPlanResultsRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: "back.out(5)" }
      );
    }
  }, [manualPlan]);

  useEffect(() => {
    if (planbutton.current) {
      gsap.fromTo(planbutton.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: "back.out(5)" }
      );
    }
  }, [user]);


  // Handle AI Plan Generation
  const handleAIPlan = async () => {
    if (!budget.trim() || !categories.trim()) {
      toast.error("Please fill in the Budget and Categories to get an AI plan.");
      return;
    }

    setLoadingAI(true);
    setAiPlan(null); // Clear previous AI plan

    const prompt = `
      You are a smart financial assistant. A user has the following spending history:

      ${JSON.stringify(entries, null, 2)}

      They want to create a "${timePeriod}" budget plan with ₹${budget}.
      They want to focus on these categories: ${categories}.

      Suggest a plan with category-wise allocation and brief reasoning.
      Respond only in a pure JSON string. The JSON should strictly follow this format:
      {
        "plan": [
          { "category": "Food", "amount": 4000, "reason": "Essential daily need" },
          { "category": "Travel", "amount": 2000, "reason": "Leisure and commute" }
        ]
      }
      Ensure 'amount' is a number.
    `;

    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json", // Crucial for pure JSON output
          },
        }
      );

      let responseText = res.data.candidates?.[0]?.content?.parts?.[0]?.text;

      // Defensive parsing: Strip markdown code block if present
      if (responseText && responseText.startsWith('```json') && responseText.endsWith('```')) {
        responseText = responseText.substring(7, responseText.length - 3).trim();
      }

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          if (parsed.plan && Array.isArray(parsed.plan)) {
            setAiPlan(parsed.plan);
            toast.success("AI spending plan generated!");
          } else {
            console.error("AI response did not contain a 'plan' array:", parsed);
            toast.error("AI returned an unexpected plan format. Please try again.");
          }
        } catch (parseError) {
          console.error("Failed to parse AI JSON response:", parseError, "Raw text:", responseText);
          toast.error("Failed to understand AI response. Please try again.");
        }
      } else {
        toast.error("No response text from AI. Please try again.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      toast.error(`Failed to generate AI plan: ${err.message || 'Network error'}`);
    } finally {
      setLoadingAI(false);
    }
  };

  // Add category to manual plan
  const addToManualPlan = () => {
    if (!currentCategory.trim() || !currentAmount || parseFloat(currentAmount) <= 0) {
      toast.error("Please enter a valid category and a positive amount.");
      return;
    }
    setManualPlan([...manualPlan, { category: currentCategory.trim(), amount: parseFloat(currentAmount) }]);
    setCurrentCategory("");
    setCurrentAmount("");
    toast.success("Category added to manual plan!");
  };

  // Remove category from manual plan
  const removeFromManualPlan = (indexToRemove) => {
    setManualPlan(manualPlan.filter((_, index) => index !== indexToRemove));
    toast.info("Category removed from plan.");
  };

  // Save the generated plan to Firestore
  const handleSavePlan = async () => {
    if (!manualPlan.length) {
      toast.error("Add at least one category to your plan before saving.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to save a plan.");
      return;
    }

    setSavingPlan(true);
    try {
      await addDoc(collection(db, "plans"), {
        userId: user.uid,
        plan: manualPlan,
        budget: parseFloat(budget) || 0, // Ensure budget is a number, default to 0 if empty
        timePeriod,
        createdAt: serverTimestamp(),
      });
      toast.success("Spending plan saved successfully!");
      setManualPlan([]); // Clear manual plan after saving
      setBudget(""); // Clear budget input
      setCategories(""); // Clear categories input
      setAiPlan(null); // Clear AI plan
    } catch (err) {
      console.error("Save Error:", err);
      toast.error(`Failed to save plan: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-gray-800 p-4 md:p-8 md:pl-24 pb-20 md:pb-8"> {/* Light background */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <h1 className="text-4xl font-extrabold mb-8 text-center text-teal-700 drop-shadow-lg">🎯 Create Your Smart Plan</h1>

      {/* AI Plan Generation Section */}
      <div ref={aiSectionRef} className="bg-teal-800 p-6 rounded-2xl shadow-xl mb-10 border border-teal-700 text-white">
        <h2 className="text-2xl font-bold mb-5 text-teal-200 flex items-center gap-3">
          <Brain className="w-7 h-7 text-teal-300" /> Generate AI Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="relative">
            <label htmlFor="timePeriod" className="absolute -top-3 left-3 text-xs text-teal-300 bg-teal-800 px-1">Time Period</label>
            <select
              id="timePeriod"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full p-3 border border-teal-600 rounded-xl bg-teal-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all appearance-none"
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          <div className="relative">
            <label htmlFor="budget" className="absolute -top-3 left-3 text-xs text-teal-300 bg-teal-800 px-1">Total Budget (₹)</label>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g., 50000"
              className="w-full p-3 border border-teal-600 rounded-xl bg-teal-700 text-white placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            />
          </div>
          <div className="relative">
            <label htmlFor="categories" className="absolute -top-3 left-3 text-xs text-teal-300 bg-teal-800 px-1">Focus Categories</label>
            <input
              type="text"
              id="categories"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="e.g., Food, Travel, Education"
              className="w-full p-3 border border-teal-600 rounded-xl bg-teal-700 text-white placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            />
          </div>
        </div>
        <button
          onClick={handleAIPlan}
          disabled={loadingAI || !budget.trim() || !categories.trim()}
          className="w-full bg-gradient-to-tr from-pink-900 to-green-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-gradient-to-bl hover:from-pink-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAI ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Generating...
            </span>
          ) : (
            <span className="flex  items-center gap-2">
              <Brain className="w-5 h-5" /> Get AI Plan
            </span>
          )}
        </button>

        {aiPlan && (
          <div ref={aiPlanResultsRef} className="mt-8 p-5 bg-teal-700 rounded-xl border border-teal-600 shadow-inner">
            <h3 className="text-xl font-bold text-teal-200 mb-4">AI Suggested Plan:</h3>
            <ul className="space-y-3">
              {aiPlan.map((item, index) => (
                <li key={index} className="bg-teal-600 p-4 rounded-lg text-white border border-teal-500 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-1">
                    <strong className="text-lg text-teal-100">{item.category}</strong>: ₹{item.amount}
                  </div>
                  <span className="text-sm italic text-teal-200 mt-1 sm:mt-0 sm:ml-4">Reason: {item.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Manual Plan Creation Section */}
      <div ref={manualSectionRef} className="bg-teal-800 p-6 rounded-2xl shadow-xl border border-teal-700 text-white">
        <h2 className="text-2xl font-bold mb-5 text-teal-200 flex items-center gap-3">
          <Plus className="w-7 h-7 text-teal-300" /> Manually Create Plan
        </h2>
        <div className="flex flex-col sm:flex-row gap-5 mb-6">
          <div className="relative flex-1">
            <label htmlFor="currentCategory" className="absolute -top-3 left-3 text-xs text-teal-300 bg-teal-800 px-1">Category</label>
            <input
              type="text"
              id="currentCategory"
              placeholder="e.g., Groceries"
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              className="w-full p-3 border border-teal-600 rounded-xl bg-teal-700 text-white placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            />
          </div>
          <div className="relative flex-1">
            <label htmlFor="currentAmount" className="absolute -top-3 left-3 text-xs text-teal-300 bg-teal-800 px-1">Amount (₹)</label>
            <input
              type="number"
              id="currentAmount"
              placeholder="e.g., 8000"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="w-full p-3 border border-teal-600 rounded-xl bg-teal-700 text-white placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            />
          </div>
          <button
            onClick={addToManualPlan}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentCategory.trim() || !currentAmount || parseFloat(currentAmount) <= 0}
          >
            <Plus className="w-5 h-5" /> Add
          </button>
        </div>

        {manualPlan.length > 0 && (
          <div ref={manualPlanResultsRef} className="mt-4 p-5 bg-teal-700 rounded-xl border border-teal-600 shadow-inner">
            <h3 className="text-xl font-bold text-teal-200 mb-4">Your Manual Plan:</h3>
            <ul className="space-y-3">
              {manualPlan.map((item, index) => (
                <li key={index} className="bg-teal-600 p-4 rounded-lg text-white border border-teal-500 flex justify-between items-center">
                  <div>
                    <strong className="text-lg text-teal-100">{item.category}</strong>: ₹{item.amount}
                  </div>
                  <button
                    onClick={() => removeFromManualPlan(index)}
                    className="text-red-600 hover:text-red-200 transition-colors duration-200"
                    title="Remove category"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleSavePlan}
          disabled={savingPlan || !manualPlan.length}
          className="mt-8 w-full bg-gradient-to-tr from-amber-700 to-green-600 text-white font-semibiz py-3 rounded-xl shadow-lg hover:bg-gradient-to-bl hover:from-amber-700 hover:to-teal-800 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingPlan ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Saving Plan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-5 h-5" /> Save Plan
            </span>
          )}
        </button>
      </div>
      <NavLink to="/allplans" ref={planbutton} className="mt-8 w-full bg-gradient-to-tr from-blue-700 to-green-600 text-white font-semibiz py-3 rounded-xl shadow-lg hover:bg-gradient-to-bl hover:from-blue-700 hover:to-teal-800 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >Show Existing Plans</NavLink>
    </div>
  );
}