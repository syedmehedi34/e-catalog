/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Edit3,
  Save,
  Loader2,
  User as UserIcon,
} from "lucide-react";

// Import Pagination Component
import Pagination from "@/Components/Pagination2"; // ← Adjust path if needed

// ── Types ──────────────────────────────────────────────────────────
interface IUser {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "user" | "admin";
  mobileNumber?: string;
  fullAddress?: string;
  wishList?: string[];
  createdAt: string;
  updatedAt: string;
}

type SortField = "name" | "email" | "role" | "createdAt";

// ── Shared styles ──────────────────────────────────────────────────
const inp = `w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800
  border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white
  placeholder-gray-400 focus:outline-none focus:border-teal-500
  focus:ring-2 focus:ring-teal-500/15 transition-all`;

const lbl =
  "block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5";

const MODAL_ID = "user-modal";
const openModal = () =>
  (document.getElementById(MODAL_ID) as HTMLDialogElement)?.showModal();
const closeModal = () =>
  (document.getElementById(MODAL_ID) as HTMLDialogElement)?.close();

// ── Main Component ─────────────────────────────────────────────────
const AdminUsersPage = () => {
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [paginatedUsers, setPaginatedUsers] = useState<IUser[]>([]); // ← Added back
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Modal states
  const [selected, setSelected] = useState<IUser | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    fullAddress: "",
    role: "user" as "user" | "admin",
  });

  // ── Fetch Users ───────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setAllUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Client-side Sorting ─────────────────────────────────────────
  const sortedUsers = useMemo(() => {
    return [...allUsers].sort((a, b) => {
      let av: any = a[sortField] ?? "";
      let bv: any = b[sortField] ?? "";

      if (sortField === "createdAt") {
        av = new Date(av);
        bv = new Date(bv);
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [allUsers, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // ── Stats ───────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total,
      admins: allUsers.filter((u) => u.role === "admin").length,
      users: allUsers.filter((u) => u.role === "user").length,
      thisMonth: allUsers.filter((u) => {
        const d = new Date(u.createdAt);
        const n = new Date();
        return (
          d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
        );
      }).length,
    }),
    [allUsers, total],
  );

  // ── Modal Handlers ──────────────────────────────────────────────
  const openView = (user: IUser) => {
    setSelected(user);
    setMode("view");
    openModal();
  };

  const openEdit = (user: IUser) => {
    setSelected(user);
    setForm({
      name: user.name,
      mobileNumber: user.mobileNumber ?? "",
      fullAddress: user.fullAddress ?? "",
      role: user.role,
    });
    setMode("edit");
    openModal();
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("User updated successfully!");
      closeModal();
      fetchUsers();
    } catch {
      toast.error("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  // Loading Skeleton
  if (loading && allUsers.length === 0) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Users
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage customer and admin accounts
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-teal-500 hover:border-teal-300 transition-all"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: total,
              icon: Users,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-500/10",
            },
            {
              label: "Customers",
              value: stats.users,
              icon: UserCheck,
              color: "text-teal-600 dark:text-teal-400",
              bg: "bg-teal-50 dark:bg-teal-500/10",
            },
            {
              label: "Admins",
              value: stats.admins,
              icon: Shield,
              color: "text-violet-600 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-500/10",
            },
            {
              label: "Joined This Month",
              value: stats.thisMonth,
              icon: Calendar,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-500/10",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {label}
                </p>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}
                >
                  <Icon size={15} className={color} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>

          {(search || roleFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-500 flex items-center gap-2">
            <UserX size={15} /> Failed to load users.{" "}
            <button onClick={fetchUsers} className="underline font-semibold">
              Try again
            </button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                  {[
                    { label: "User", field: "name" as SortField },
                    {
                      label: "Email",
                      field: "email" as SortField,
                      hidden: "hidden md:table-cell",
                    },
                    { label: "Role", field: "role" as SortField },
                    {
                      label: "Wishlist",
                      field: null,
                      hidden: "hidden lg:table-cell",
                    },
                    {
                      label: "Joined",
                      field: "createdAt" as SortField,
                      hidden: "hidden lg:table-cell",
                    },
                  ].map(({ label, field, hidden }) => (
                    <th
                      key={label}
                      className={`text-left px-4 py-3.5 first:pl-5 ${hidden ?? ""}`}
                    >
                      {field ? (
                        <button
                          onClick={() => toggleSort(field)}
                          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-teal-600 transition-colors"
                        >
                          {label}
                          <span className="flex flex-col ml-1 opacity-40">
                            <ChevronUp
                              size={10}
                              className={
                                sortField === field && sortDir === "asc"
                                  ? "opacity-100 text-teal-500"
                                  : ""
                              }
                            />
                            <ChevronDown
                              size={10}
                              className={
                                sortField === field && sortDir === "desc"
                                  ? "opacity-100 text-teal-500"
                                  : ""
                              }
                            />
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {label}
                        </span>
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedUsers.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Users
                        size={40}
                        className="mx-auto text-gray-300 dark:text-gray-700 mb-3"
                      />
                      <p className="text-gray-500 font-medium">
                        No users found
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user._id}
                      onClick={() => openView(user)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      <td className="pl-5 pr-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                            {user.photo ? (
                              <Image
                                src={user.photo}
                                fill
                                alt={user.name}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate md:hidden">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            user.role === "admin"
                              ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                              : "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <Shield size={9} />
                          ) : (
                            <UserIcon size={9} />
                          )}
                          {user.role === "admin" ? "Admin" : "Customer"}
                        </span>
                      </td>

                      {/*  */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Heart size={11} className="text-red-400" />
                          {user.wishList?.length ?? 0}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-BD",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </td>

                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openView(user)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all"
                          >
                            <UserIcon size={14} />
                          </button>
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Component Added Here */}
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
            <Pagination
              data={sortedUsers}
              itemsPerPage={10} // You can change this number if you want
              onPageDataChange={setPaginatedUsers}
            />
          </div>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      <dialog id={MODAL_ID} className="modal">
        <div className="modal-box max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-0 overflow-hidden">
          {selected && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                    {selected.photo ? (
                      <Image
                        src={selected.photo}
                        fill
                        alt={selected.name}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                        {selected.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {selected.name}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selected.role === "admin"
                          ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          : "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      }`}
                    >
                      {selected.role === "admin" ? (
                        <Shield size={8} />
                      ) : (
                        <UserIcon size={8} />
                      )}
                      {selected.role === "admin" ? "Admin" : "Customer"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {mode === "view" && (
                    <button
                      onClick={() => {
                        setForm({
                          name: selected.name,
                          mobileNumber: selected.mobileNumber ?? "",
                          fullAddress: selected.fullAddress ?? "",
                          role: selected.role,
                        });
                        setMode("edit");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 size={11} /> Edit
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                {mode === "view" ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          label: "Account ID",
                          value: selected._id.slice(-8).toUpperCase(),
                          icon: <Shield size={12} />,
                          mono: true,
                        },
                        {
                          label: "Wishlist",
                          value: `${selected.wishList?.length ?? 0} items`,
                          icon: <Heart size={12} />,
                        },
                        {
                          label: "Joined",
                          value: new Date(
                            selected.createdAt,
                          ).toLocaleDateString("en-BD", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                          icon: <Calendar size={12} />,
                        },
                        {
                          label: "Last Updated",
                          value: new Date(
                            selected.updatedAt,
                          ).toLocaleDateString("en-BD", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                          icon: <RefreshCw size={12} />,
                        },
                      ].map(({ label, value, icon, mono }) => (
                        <div
                          key={label}
                          className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                            {icon}
                            {label}
                          </div>
                          <p
                            className={`text-sm font-bold text-gray-800 dark:text-white ${mono ? "font-mono" : ""}`}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-0 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      {[
                        {
                          icon: <Mail size={13} />,
                          label: "Email",
                          value: selected.email,
                        },
                        {
                          icon: <Phone size={13} />,
                          label: "Phone",
                          value: selected.mobileNumber,
                        },
                        {
                          icon: <MapPin size={13} />,
                          label: "Address",
                          value: selected.fullAddress,
                        },
                      ].map(({ icon, label, value }) => (
                        <div
                          key={label}
                          className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 bg-white dark:bg-gray-900"
                        >
                          <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                            {icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              {label}
                            </p>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mt-0.5">
                              {value || (
                                <span className="text-gray-400 italic font-normal text-xs">
                                  Not provided
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div>
                      <label className={lbl}>Full Name</label>
                      <div className="relative">
                        <UserIcon
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                          className={inp}
                          placeholder="Full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={lbl}>Phone</label>
                      <div className="relative">
                        <Phone
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={form.mobileNumber}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              mobileNumber: e.target.value,
                            }))
                          }
                          className={inp}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={lbl}>Address</label>
                      <div className="relative">
                        <MapPin
                          size={14}
                          className="absolute left-3 top-3 text-gray-400"
                        />
                        <textarea
                          rows={3}
                          value={form.fullAddress}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              fullAddress: e.target.value,
                            }))
                          }
                          className={`${inp} pl-10 resize-none`}
                          placeholder="Full address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={lbl}>Role</label>
                      <div className="relative">
                        <Shield
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <select
                          value={form.role}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              role: e.target.value as "user" | "admin",
                            }))
                          }
                          className={`${inp} pl-10`}
                        >
                          <option value="user">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
                >
                  {mode === "view" ? "Close" : "Cancel"}
                </button>

                {mode === "edit" && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-teal-500 hover:bg-teal-400 disabled:opacity-50 flex items-center gap-2 transition-all"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save Changes
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default AdminUsersPage;
