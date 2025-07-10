import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import gsap from "gsap";
import { jsPDF } from "jspdf";
import { Trash2 } from "lucide-react";

export default function AllPlans() {
  const [user] = useAuthState(auth);
  const [plans, setPlans] = useState([]);
  const containerRef = useRef(null);
  const planRefs = useRef({});

  useEffect(() => {
    if (!user?.uid) return;

    const fetchPlans = async () => {
      const q = query(collection(db, "plans"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(data);
    };

    fetchPlans();
  }, [user]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "back.out(1.7)" }
      );
    }
  }, [plans]);

  const deletePlan = async (plan) => {
    const element = planRefs.current[plan.id];
    if (element) {
      gsap.to(element, {
        opacity: 0,
        x: -50,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.4,
        onComplete: async () => {
          await deleteDoc(doc(db, "plans", plan.id));
          setPlans(prev => prev.filter(p => p.id !== plan.id));
        },
      });
    } else {
      await deleteDoc(doc(db, "plans", plan.id));
      setPlans(prev => prev.filter(p => p.id !== plan.id));
    }
  };

  const downloadPlan = (plan) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${plan.timePeriod} Plan`, 20, 20);
    doc.setFontSize(12);

    let y = 40;
    plan.plan.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.category} - ₹${item.amount}`, 20, y);
      y += 10;
    });

    doc.text(`\nTotal Budget: ₹${plan.budget}`, 20, y + 10);
    doc.save(`${plan.timePeriod}_Plan.pdf`);
  };

  const renderPlan = (plan) => {
    const total = plan.plan.reduce((sum, item) => sum + item.amount, 0);
    return (
      <div
        key={plan.id}
        ref={(el) => (planRefs.current[plan.id] = el)}
        className="bg-white text-black p-6 rounded-2xl shadow-xl w-full max-w-2xl transition-all"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-teal-800">{plan.timePeriod} Plan</h2>
          <div className="flex gap-2">
            <button
              onClick={() => downloadPlan(plan)}
              className="text-sm bg-teal-600 text-white px-4 py-1 rounded-full hover:bg-teal-700"
            >
              Download PDF
            </button>
            <button
              onClick={() => deletePlan(plan)}
              className="text-sm bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-teal-100 text-teal-900">
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Allocated Amount</th>
              </tr>
            </thead>
            <tbody>
              {plan.plan.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-3 font-medium">{item.category}</td>
                  <td className="py-2 px-3">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right mt-4 font-semibold text-teal-700">
          Total: ₹{total}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-teal-950 text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">📋 Your Spending Plans</h1>

      <div
        ref={containerRef}
        className="flex flex-col lg:flex-row justify-center gap-8 items-start flex-wrap"
      >
        {plans.length === 0 ? (
          <p className="text-center text-gray-300 text-lg">No plans found.</p>
        ) : (
          plans.map(renderPlan)
        )}
      </div>
    </div>
  );
}
