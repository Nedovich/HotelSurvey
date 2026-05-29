import { AdminShell } from "@/components/admin-shell";
import { requireHotelContext } from "@/lib/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await requireHotelContext();

  return (
    <AdminShell
      hotelName={context.hotel.name}
      isImpersonating={context.isImpersonating}
      userName={context.session.user.name}
    >
      {children}
    </AdminShell>
  );
}
