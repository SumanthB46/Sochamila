"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";

const API_BASE = "http://localhost:5000/api";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Prefer fetching authoritative profile from backend when available
      (async () => {
        try {
          const token =
            (typeof window !== "undefined" && (sessionStorage.getItem("token") || localStorage.getItem("token") || localStorage.getItem("authToken"))) ||
            null;
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const res = await fetch(`${API_BASE}/customer/profile`, { headers });
          const body = await res.json().catch(() => null);
          if (res.ok && body && body.data) {
            setName(body.data.name || user.name || "");
            setEmail(body.data.email || user.email || "");
            setPhone(body.data.phone || "");
            setAvatarUrl(body.data.avatarUrl || null);
            return;
          }
        } catch (err) {
          // ignore and fallback to token/user
        }

        setName(user.name || "");
        setEmail(user.email || "");
        setAvatarUrl((user as any).avatarUrl || null);
      })();
    }
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setMessage("Please sign in to save your profile.");

    // client-side validation
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (!name || !name.trim()) newErrors.name = "Name is required";
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) newErrors.email = "Valid email is required";
    if (!phone || !phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return setMessage("Please fix validation errors before saving.");
    }

    setSaving(true);
    setMessage(null);
    try {
      // Use customer profile endpoint with auth header
      const token =
        (typeof window !== "undefined" && (sessionStorage.getItem("token") || localStorage.getItem("token") || localStorage.getItem("authToken"))) ||
        null;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/customer/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ name, email, phone }),
      });

      const body = await res.json().catch(() => null);
      if (res.ok) {
        setMessage("Profile saved.");
        setEditingName(false);
        setEditingEmail(false);
        setErrors({});
        if (body && body.data && (body.data.avatarUrl || body.data.avatarUrl === null)) {
          setAvatarUrl(body.data.avatarUrl || null);
        }
      } else if (body && body.message) {
        setMessage(String(body.message));
      } else {
        setMessage("Failed to save profile.");
      }
    } catch (err) {
      console.error("Save profile failed:", err);
      setMessage("Failed to save — network error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <div className="text-sm text-gray-600">You are not signed in. <Link href="/login" className="text-indigo-600">Sign in</Link></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="col-span-1">
          <div className="bg-white p-4 rounded shadow-sm sticky top-24">
            <div className="font-semibold mb-2">Account</div>
            <nav className="flex flex-col text-sm text-gray-700">
              <Link href="/dashboard" className="py-2">Dashboard</Link>
              <Link href="/account" className="py-2">Profile</Link>
              <Link href="/orders" className="py-2">Orders</Link>
              <Link href="/wishlist" className="py-2">Wishlist</Link>
              <Link href="/account/addresses" className="py-2">Addresses</Link>
              <Link href="/account/payment" className="py-2">Payment methods</Link>
            </nav>

            <div className="mt-4 border-t pt-3">
              <button
                onClick={() => {
                  // logout: clear tokens and redirect to login
                  try {
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  } catch (e) {
                    console.error('Logout cleanup error', e);
                  }
                  router.replace('/login');
                }}
                className="w-full text-left text-sm text-red-600 py-2"
              >
                🔒 Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-1 lg:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-500 font-semibold">{(user?.name || "").split(" ").map(s=>s[0]).slice(0,2).join("") || "U"}</div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Profile</h2>
                    <div className="text-sm text-gray-500">Manage your personal information</div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e)=>{
                    const f = e.currentTarget.files && e.currentTarget.files[0];
                    if (!f) return;
                    try {
                      const fd = new FormData();
                      fd.append('file', f);
                      const up = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: fd });
                      const j = await up.json().catch(()=>null);
                      if (!up.ok || !j || !j.url) return alert('Upload failed');
                      const url = j.url;
                      // persist avatar to profile
                      const token = (typeof window !== 'undefined' && (sessionStorage.getItem('token') || localStorage.getItem('token') || localStorage.getItem('authToken'))) || null;
                      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                      const res = await fetch(`${API_BASE}/customer/profile`, { method: 'PUT', headers, body: JSON.stringify({ avatarUrl: url }) });
                      const body = await res.json().catch(()=>null);
                      if (res.ok) {
                        setAvatarUrl(url);
                        setMessage('Avatar updated');
                      } else {
                        alert((body && (body.message || body.error)) || 'Failed to save avatar');
                      }
                    } catch (err) {
                      console.error('Avatar upload error', err);
                      alert('Upload failed');
                    }
                  }} />
                  <button onClick={()=>fileRef.current?.click()} className="ml-2 px-3 py-1 border rounded text-sm">Change picture</button>
                </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Full name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      name="fullName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      readOnly={!editingName}
                      className={`w-full border rounded px-3 py-2 ${editingName ? "" : "bg-gray-50 cursor-default"}`}
                      placeholder="Your full name"
                    />
                    <button
                      type="button"
                      onClick={() => { setEditingName(true); setTimeout(() => { const el = document.querySelector('input[name="fullName"]') as HTMLInputElement | null; el?.focus(); }, 0); }}
                      aria-label="Edit name"
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      ✎
                    </button>
                  </div>
                  {errors.name && <div className="text-sm text-red-600 mt-1">{errors.name}</div>}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!editingEmail}
                      className={`w-full border rounded px-3 py-2 ${editingEmail ? "" : "bg-gray-50 cursor-default"}`}
                      placeholder="email@example.com"
                      type="email"
                    />
                    <button
                      type="button"
                      onClick={() => { setEditingEmail(true); setTimeout(() => { const el = document.querySelector('input[name="email"]') as HTMLInputElement | null; el?.focus(); }, 0); }}
                      aria-label="Edit email"
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      ✎
                    </button>
                  </div>
                  {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Phone Number</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      readOnly={!editingPhone}
                      className={`w-full border rounded px-3 py-2 ${editingPhone ? "" : "bg-gray-50 cursor-default"}`}
                      placeholder="Enter phone number"
                      type="tel"
                    />
                    <button
                      type="button"
                      onClick={() => { setEditingPhone(true); setTimeout(() => { const el = document.querySelector('input[name="phone"]') as HTMLInputElement | null; el?.focus(); }, 0); }}
                      aria-label="Edit phone"
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      ✎
                    </button>
                  </div>
                  {errors.phone && <div className="text-sm text-red-600 mt-1">{errors.phone}</div>}
                </div>
              </div>

              {/* Show Save/Cancel only when editing */}
              {(editingName || editingEmail || editingPhone) && (
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:opacity-95 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setName(user.name || ""); setEmail(user.email || ""); setPhone(""); setEditingName(false); setEditingEmail(false); setEditingPhone(false); setMessage(null); setErrors({}); }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>

                  {message && <div className="text-sm text-gray-600">{message}</div>}
                </div>
              )}
            </form>
          </section>

          <section className="bg-white p-6 rounded shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Addresses</h2>
                <div className="text-sm text-gray-500">Manage your saved addresses for faster checkout</div>
              </div>
              <Link href="/account/addresses/new" className="text-indigo-600">Add address</Link>
            </div>

            <div className="text-sm text-gray-600">You have no saved addresses.</div>
          </section>

          <section className="bg-white p-6 rounded shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Payment Methods</h2>
                <div className="text-sm text-gray-500">Save cards or UPI for faster checkout</div>
              </div>
              <Link href="/account/payment" className="text-indigo-600">Manage</Link>
            </div>

            <div className="text-sm text-gray-600">No payment methods saved.</div>
          </section>
        </main>
      </div>
    </div>
  );
}
