// need to make functional this page
"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Ban,
  MapPin,
  Phone,
  User,
  CreditCard,
  Calendar,
  ShoppingBag,
  RefreshCw,
  X,
} from "lucide-react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────
interface OrderItem {
  title: string;
  image: string;
  brand?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}
interface Order {
  _id: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
  deliveryAddress: {
    fullName: string;
    phone: string;
    altPhone?: string;
    division: string;
    district: string;
    upazila: string;
    address: string;
  };
  pricing: {
    subtotal: number;
    shippingCharge: number;
    couponDiscount: number;
    total: number;
  };
  note?: string;
}

// ── Config ─────────────────────────────────────────────────────────
const STEPS = [
  {
    key: "processing",
    label: "Order Placed",
    icon: Clock,
    desc: "Your order has been received",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    desc: "Order confirmed by seller",
  },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "On the way to you" },
  {
    key: "delivered",
    label: "Delivered",
    icon: Package,
    desc: "Successfully delivered",
  },
];

const STATUS_IDX: Record<string, number> = {
  processing: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

// Estimated days from each status
const ETA: Record<string, string> = {
  processing: "3–5 business days",
  confirmed: "2–4 business days",
  shipped: "1–2 business days",
  delivered: "Delivered",
  cancelled: "—",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  sslcommerz: "SSLCommerz",
  stripe: "Stripe",
};

const PAYMENT_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  cod_pending: {
    label: "COD Pending",
    cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  },
  pending: {
    label: "Pending",
    cls: "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700",
  },
  paid: {
    label: "Paid",
    cls: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20",
  },
  failed: {
    label: "Failed",
    cls: "bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/20",
  },
};

// ── Helpers ────────────────────────────────────────────────────────
const fmt = (n: number) => `৳${n.toLocaleString("en-BD")}`;

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// ── Main Page ──────────────────────────────────────────────────────
const TrackOrderPage = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // Try orderId first, then search by phone/email via query param
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setError(
          "No order found. Please check your Order ID, phone, or email.",
        );
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = order ? (STATUS_IDX[order.orderStatus] ?? -1) : -1;
  const isCancelled = order?.orderStatus === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Package size={13} className="text-teal-500" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-500">
              Dashboard
            </p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Track Order
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Search by Order ID, phone number, or email
          </p>
        </div>

        {/* Search box */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. EB-20260311-XXXXX, 01XXXXXXXXX, email@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setOrder(null);
                    setError("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              {loading ? "Searching…" : "Track"}
            </button>
          </div>

          {/* Search type hints */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {[
              { icon: ShoppingBag, label: "Order ID" },
              { icon: Phone, label: "Phone" },
              { icon: User, label: "Email" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
              >
                <Icon size={10} className="text-teal-500" /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
            <Ban size={15} /> {error}
          </div>
        )}

        {/* ── Order Result ── */}
        {order && (
          <div className="space-y-4">
            {/* Order header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Order ID
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                    {order.orderId}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                    <Calendar size={11} /> Placed on {fmtDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${PAYMENT_STATUS_CFG[order.paymentStatus]?.cls ?? ""}`}
                  >
                    {PAYMENT_STATUS_CFG[order.paymentStatus]?.label ??
                      order.paymentStatus}
                  </span>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1 justify-end">
                    <CreditCard size={11} />{" "}
                    {PAYMENT_METHOD_LABEL[order.paymentMethod] ??
                      order.paymentMethod}
                  </p>
                </div>
              </div>

              {/* ETA */}
              {!isCancelled && (
                <div className="mt-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-500 mb-0.5">
                      Estimated Delivery
                    </p>
                    <p className="text-sm font-bold text-teal-700 dark:text-teal-300">
                      {ETA[order.orderStatus] ?? "—"}
                    </p>
                  </div>
                  <Truck size={20} className="text-teal-400" />
                </div>
              )}

              {isCancelled && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-2">
                  <Ban size={14} className="text-red-500" />
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    This order has been cancelled
                  </p>
                </div>
              )}
            </div>

            {/* ── Progress tracker ── */}
            {!isCancelled && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">
                  Order Progress
                </p>
                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100 dark:bg-gray-800" />
                  <div
                    className="absolute left-5 top-5 w-0.5 bg-teal-500 transition-all duration-700"
                    style={{
                      height:
                        currentIdx >= 0
                          ? `${(currentIdx / (STEPS.length - 1)) * 100}%`
                          : "0%",
                    }}
                  />

                  <div className="space-y-6">
                    {STEPS.map((step, i) => {
                      const done = i <= currentIdx;
                      const current = i === currentIdx;
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.key}
                          className="flex items-start gap-4 relative"
                        >
                          {/* Step circle */}
                          <div
                            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                              done
                                ? "bg-teal-500 text-white shadow-md shadow-teal-500/30"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                            } ${current ? "ring-4 ring-teal-500/20" : ""}`}
                          >
                            <Icon size={15} />
                          </div>

                          {/* Step info */}
                          <div className="flex-1 pt-1.5">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm font-bold ${done ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
                              >
                                {step.label}
                              </p>
                              {current && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-white">
                                  Current
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs mt-0.5 ${done ? "text-gray-400" : "text-gray-300 dark:text-gray-600"}`}
                            >
                              {step.desc}
                            </p>
                            {current && (
                              <p className="text-[10px] font-semibold text-teal-500 mt-1">
                                Est. {ETA[order.orderStatus]}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Items ── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                <ShoppingBag size={12} /> Items ({order.items.length})
              </p>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700">
                        <Image
                          src={item.image}
                          fill
                          alt={item.title}
                          className="object-contain p-1"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {item.brand && (
                          <span className="text-[10px] text-teal-500 font-bold uppercase">
                            {item.brand}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">
                            Color: {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {fmt(item.subtotal)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {item.quantity} × {fmt(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Pricing + Address ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pricing */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Price Summary
                </p>
                <div className="space-y-2 text-sm">
                  {[
                    ["Subtotal", fmt(order.pricing.subtotal)],
                    ["Shipping", fmt(order.pricing.shippingCharge)],
                    ...(order.pricing.couponDiscount > 0
                      ? [["Coupon", `-${fmt(order.pricing.couponDiscount)}`]]
                      : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-500">{k}</span>
                      <span
                        className={`font-semibold ${v.startsWith("-") ? "text-teal-500" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2.5 border-t border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-base font-black text-teal-600 dark:text-teal-400">
                      {fmt(order.pricing.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <MapPin size={11} /> Delivery Address
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User size={11} className="text-gray-400 shrink-0" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {order.deliveryAddress.fullName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={11} className="text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500">
                      {order.deliveryAddress.phone}
                      {order.deliveryAddress.altPhone &&
                        ` / ${order.deliveryAddress.altPhone}`}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={11}
                      className="text-gray-400 shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {order.deliveryAddress.address},{" "}
                      {order.deliveryAddress.upazila},{" "}
                      {order.deliveryAddress.district},{" "}
                      {order.deliveryAddress.division}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            {order.note && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                  Order Note
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {order.note}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial empty state */}
        {/* {!order && !error && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-400">
              Enter your Order ID, phone, or email to track your order
            </p>
          </div>
        )} */}
        {!order && !error && !loading && (
          <div className="text-center py-14">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-300 dark:text-gray-600" />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-700 text-gray-400 mb-3">
              Coming Soon
            </span>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mt-2 mb-1">
              Order tracking is on the way
            </h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
              We&apos;re working hard to bring you real-time order tracking.
              Stay tuned — this feature will be available very soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
