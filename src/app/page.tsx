import { DEFAULT_DEMO_TABLE } from "@/lib/config";
import { MenuClient } from "@/features/menu/MenuClient";

export default function Home() {
  return <MenuClient table={DEFAULT_DEMO_TABLE} />;
}
