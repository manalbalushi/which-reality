import type { Metadata } from "next";
import { CartClient } from "./cart-client";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your NORA gift selections before checkout.",
};

export default function CartPage() {
  return <CartClient />;
}
