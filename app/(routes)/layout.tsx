import AppShell from "./_components/AppShell";

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
