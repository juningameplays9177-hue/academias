import { UltraLayoutClient } from "@/components/ultra/ultra-layout-client";

export default function UltraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UltraLayoutClient>{children}</UltraLayoutClient>;
}
