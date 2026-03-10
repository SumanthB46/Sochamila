"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type PaymentMethod =
  | { id: string; type: "card"; cardNumber: string; name: string; expiry: string }
  | { id: string; type: "upi"; upiId: string; name?: string };

const STORAGE_KEY = "paymentMethods";

function maskCard(num: string) {
  const clean = num.replace(/\s+/g, "");
  if (clean.length < 4) return num;
  const last4 = clean.slice(-4);
  return `**** **** **** ${last4}`;
}

export default function PaymentPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<"card" | "upi">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setMethods(JSON.parse(raw));
    } catch (err) {
      console.error("Failed to load payment methods:", err);
    }
  }, []);

  const persist = (next: PaymentMethod[]) => {
    setMethods(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error("Failed to persist payment methods:", err);
    }
  };

  const addMethod = () => {
    if (type === "card") {
      if (!cardNumber.trim() || !name.trim() || !expiry.trim()) {
        alert("Please enter card number, name and expiry");
        return;
      }
      const id = `pm_${Date.now()}`;
      const pm: PaymentMethod = { id, type: "card", cardNumber: cardNumber.trim(), name: name.trim(), expiry: expiry.trim() };
      persist([...methods, pm]);
    } else {
      if (!upiId.trim()) {
        alert("Enter UPI id");
        return;
      }
      const id = `pm_${Date.now()}`;
      const pm: PaymentMethod = { id, type: "upi", upiId: upiId.trim(), name: name.trim() || undefined };
      persist([...methods, pm]);
    }

    // reset
    setAdding(false);
    setCardNumber("");
    setName("");
    setExpiry("");
    setUpiId("");
  };

  const remove = (id: string) => {
    if (!confirm("Remove payment method?")) return;
    persist(methods.filter((m) => m.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <Link href="/account" className="text-indigo-600">Back to account</Link>
      </div>

      <div className="bg-white p-6 rounded shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Save cards or UPI for faster checkout</div>
          </div>
          <div>
            <button onClick={() => setAdding(!adding)} className="px-3 py-2 bg-indigo-600 text-white rounded">{adding ? "Close" : "Add payment method"}</button>
          </div>
        </div>

        {adding && (
          <div className="mb-4 border rounded p-4">
            <div className="flex gap-3 mb-3">
              <label className={`px-3 py-2 border rounded cursor-pointer ${type==="card"?"bg-indigo-50 border-indigo-300":""}`}>
                <input type="radio" checked={type==="card"} onChange={() => setType("card")} /> Card
              </label>
              <label className={`px-3 py-2 border rounded cursor-pointer ${type==="upi"?"bg-indigo-50 border-indigo-300":""}`}>
                <input type="radio" checked={type==="upi"} onChange={() => setType("upi")} /> UPI
              </label>
            </div>

            {type === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Card number" value={cardNumber} onChange={(e)=>setCardNumber(e.target.value)} className="border rounded px-3 py-2" />
                <input placeholder="Name on card" value={name} onChange={(e)=>setName(e.target.value)} className="border rounded px-3 py-2" />
                <input placeholder="MM/YY" value={expiry} onChange={(e)=>setExpiry(e.target.value)} className="border rounded px-3 py-2" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="UPI ID (e.g. your@upi)" value={upiId} onChange={(e)=>setUpiId(e.target.value)} className="border rounded px-3 py-2" />
                <input placeholder="Name (optional)" value={name} onChange={(e)=>setName(e.target.value)} className="border rounded px-3 py-2" />
              </div>
            )}

            <div className="mt-3">
              <button onClick={addMethod} className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
            </div>
          </div>
        )}

        <div>
          {methods.length === 0 ? (
            <div className="text-sm text-gray-600">No payment methods saved.</div>
          ) : (
            <ul className="space-y-3">
              {methods.map((m) => (
                <li key={m.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    {m.type === "card" ? (
                      <div>
                        <div className="font-medium">{maskCard((m as any).cardNumber)}</div>
                        <div className="text-sm text-gray-500">{(m as any).name} · Expires {(m as any).expiry}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{(m as any).upiId}</div>
                        <div className="text-sm text-gray-500">{(m as any).name || "UPI"}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={()=>remove(m.id)} className="text-sm text-red-500">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
