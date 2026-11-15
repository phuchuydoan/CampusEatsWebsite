import type { Metadata } from "next";
import { KitchenBoard } from "@/components/KitchenBoard";

export const metadata: Metadata = { title: "Kitchen", robots: { index: false } };

export default function KitchenPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 className="board-title text-4xl">Kitchen</h1>
      <KitchenBoard />
    </div>
  );
}
