import type { Metadata } from "next";
import AdminCrew from "@/components/AdminCrew";

export const metadata: Metadata = {
  title: "Crew moderation",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main style={{ paddingBlock: "4rem" }}>
      <AdminCrew />
    </main>
  );
}
