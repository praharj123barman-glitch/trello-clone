export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[var(--color-background)]">
      <div className="absolute inset-0 aurora" />
      <div className="absolute inset-0 grid-noise opacity-50" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
