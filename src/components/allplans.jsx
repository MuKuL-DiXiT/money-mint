import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

export default function allplans() {
  const [user] = useAuthState(auth);
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [monthlyPlans, setMonthlyPlans] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchPlans = async () => {
      const q = query(collection(db, "plans"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setWeeklyPlans(data.filter(plan => plan.type === "weekly"));
      setMonthlyPlans(data.filter(plan => plan.type === "monthly"));
    };

    fetchPlans();
  }, [user]);

  const renderTable = (plans, title) => (
    <div className="bg-white text-black p-6 rounded-2xl shadow-xl w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-teal-800">{title} Plans</h2>
      {plans.length === 0 ? (
        <p className="text-gray-500">No {title.toLowerCase()} plans found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-teal-100 text-teal-900">
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Allocated Amount</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 font-medium">{plan.category}</td>
                  <td className="py-2 px-3">₹{plan.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-teal-950 text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">📋 Your Spending Plans</h1>

      <div className="flex flex-col lg:flex-row justify-center gap-8 items-start">
        {renderTable(weeklyPlans, "Weekly")}
        {renderTable(monthlyPlans, "Monthly")}
      </div>
    </div>
  );
}
