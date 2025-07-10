import { useState, useRef, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebaseConfig";
import { PlusCircle } from "lucide-react";
import gsap from "gsap";

export default function AddEntryModal() {
  const [user] = useAuthState(auth);
  const modalRef = useRef(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [purpose, setPurpose] = useState("useful");

  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 100, scale: 0.7 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 2,
        ease: "back.out(7)", // more dramatic bounce effect
      }
    );
  }, []);


  const handleSubmit = async () => {
    if (!amount || isNaN(amount)) {
      console.log("Invalid amount:", amount);
      return;
    }

    if (!category || category.trim() === "") {
      console.log("Invalid category:", category);
      return;
    }

    if (!user?.uid) {
      console.log("User not logged in.");
      return;
    }

    try {
      await addDoc(collection(db, "entries"), {
        userId: user.uid,
        amount: parseFloat(amount),
        category: category.trim(),
        purpose,
        createdAt: serverTimestamp(),
      });

      setAmount("");
      setCategory("");
    } catch (err) {
      console.error("Error adding entry:", err);
    }
  };

  return (
    <div ref={modalRef} className="bg-teal-950 text-black p-8 rounded-2xl shadow-xl max-w-md mx-auto mt-20 space-y-5 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        <PlusCircle className="text-teal-600 w-6 h-6" />
        <h2 className="text-xl font-bold text-teal-700">Add a New Entry</h2>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="💸 Amount spent"
        className="border border-teal-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="📦 Category (Food, Travel)"
        className="border border-teal-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <select
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="border border-teal-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="useful">✅ Useful</option>
        <option value="important">⭐ Important</option>
        <option value="useless">🗑️ Useless</option>
        <option value="impulse">⚡ Impulse</option>
      </select>

      <button
        onClick={handleSubmit}
        className="bg-teal-600 text-white py-3 px-6 rounded-xl hover:bg-teal-700 hover:scale-105 transition-all duration-300 w-full"
      >
        ➕ Add Entry
      </button>
    </div>
  );
}
