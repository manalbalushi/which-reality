import type { Metadata } from "next";
import { OccasionsClient } from "./occasions-client";

export const metadata: Metadata = {
  title: "Shop By Occasion",
  description:
    "Find the perfect curated gift for every occasion in Oman — birthdays, weddings, Eid, Ramadan, new babies and corporate milestones.",
};

export default function OccasionsPage() {
  return <OccasionsClient />;
}
