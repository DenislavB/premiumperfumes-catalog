export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0B08] text-[#F5ECD7]">
      {children}
    </div>
  );
}
