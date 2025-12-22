import { AdminSidebar } from "@/components/AdminSidebar";
import { CreateClassButton } from "@/components/CreateClassButton";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 w-full min-w-0">
                {children}
            </main>
            <CreateClassButton />
        </div>
    );
}
