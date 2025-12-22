"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Clock, LogOut } from "lucide-react";
import Link from "next/link";

export default function PendingApproval() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl shadow-lg border">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Account Pending Approval</h1>
                    <p className="text-muted-foreground">
                        Your account has been created successfully. An administrator needs to approve your request before you can access the portal.
                    </p>
                </div>

                <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                        Please check back later or contact support if you have any questions.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            window.location.href = "/auth";
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
