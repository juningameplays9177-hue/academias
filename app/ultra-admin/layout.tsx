import { UltraLayoutClient } from "@/components/ultra/ultra-layout-client";

export const dynamic = "force-dynamic";

export default function UltraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UltraLayoutClient>{children}</UltraLayoutClient>;
}
