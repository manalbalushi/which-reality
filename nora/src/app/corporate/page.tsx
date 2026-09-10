import type { Metadata } from "next";
import { CorporateClient } from "./corporate-client";

export const metadata: Metadata = {
  title: "Corporate Gifts Oman",
  description:
    "Corporate gifting in Oman for employees, clients, VIPs and events — bulk orders, custom branding, personalized cards and coordinated delivery.",
};

export default function CorporatePage() {
  return <CorporateClient />;
}
