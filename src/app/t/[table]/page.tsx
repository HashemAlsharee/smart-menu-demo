import { notFound } from "next/navigation";
import { TABLE_COUNT } from "@/lib/config";
import { MenuClient } from "@/features/menu/MenuClient";

export default async function TablePage({ params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const n = Number(table);
  if (!Number.isInteger(n) || n < 1 || n > TABLE_COUNT) notFound();
  return <MenuClient table={n} />;
}
