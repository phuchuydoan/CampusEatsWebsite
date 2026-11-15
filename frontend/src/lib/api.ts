import type { KitchenOrder, Menu, NewOrder, Order, OrderStatus } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type FieldIssue = { path: string; message: string };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: FieldIssue[] = [],
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const { token, ...rest } = init ?? {};
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...rest,
      headers: {
        ...(rest.body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    // status 0 = the request never reached the API.
    throw new ApiError(0, "We can't reach the kitchen right now. Check your connection and try again.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.message ?? "Something went wrong. Please try again.",
      Array.isArray(body?.error?.details) ? body.error.details : [],
    );
  }
  return body as T;
}

export const fetchMenu = () => request<Menu>("/menu");

export const placeOrder = (order: NewOrder) =>
  request<{ order: Order }>("/orders", { method: "POST", body: JSON.stringify(order) });

export const fetchOrder = (code: string) => request<{ order: Order }>(`/orders/${encodeURIComponent(code)}`);

export const fetchKitchenOrders = (token: string) =>
  request<{ orders: KitchenOrder[] }>("/admin/orders?scope=active", { token });

export const updateOrderStatus = (token: string, code: string, status: OrderStatus) =>
  request<{ order: KitchenOrder }>(`/admin/orders/${encodeURIComponent(code)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    token,
  });
