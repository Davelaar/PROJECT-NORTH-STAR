"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { ShopMessages } from "../types";
import { CART_KEY } from "../shop-grid";

type OrderStatus = {
  uuid: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "expired";
};

export function ShopSuccessClient({
  orderUuid,
  messages,
}: {
  orderUuid: string;
  messages: ShopMessages;
}) {
  const [status, setStatus] = useState<OrderStatus["status"]>("pending");

  useEffect(() => {
    let cancelled = false;
    let ticks = 0;
    async function tick() {
      ticks += 1;
      try {
        const order = await apiGet<OrderStatus>(`/api/v1/shop/orders/${orderUuid}`);
        if (cancelled) return;
        setStatus(order.status);
        if (order.status === "paid" || order.status === "fulfilled") {
          localStorage.removeItem(CART_KEY);
          return;
        }
      } catch {
        // keep polling briefly
      }
      if (!cancelled && ticks < 20) window.setTimeout(tick, 2000);
    }
    tick();
    return () => {
      cancelled = true;
    };
  }, [orderUuid]);

  const text =
    status === "paid" || status === "fulfilled"
      ? messages.successPaid
      : status === "cancelled" || status === "expired"
        ? messages.successFailed
        : messages.successPending;

  return <p className={status === "paid" ? "banner-ok" : "banner-warn"}>{text}</p>;
}
