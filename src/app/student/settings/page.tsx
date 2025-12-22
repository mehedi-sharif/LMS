"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, User, Mail, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StudentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordUpdating, setPasswordUpdating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                router.push("/auth");
                return;
            }

            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            setProfile(profileData);
            setFullName(profileData?.full_name || "");
            setEmail(user.email || "");
            setLoading(false);
        };
        fetchProfile();
    }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const supabase = createClient();
            // Verify user exists before update
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Session expired. Please log in again.");
                router.push("/auth");
                return;
            }

            // Update Profiles table
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ full_name: fullName })
                .eq("id", user.id);

            if (profileError) throw profileError;

            // Update Auth Email if changed
            if (email !== user.email) {
                const { error: authError } = await supabase.auth.updateUser({ email });
                if (authError) throw authError;
                toast.success("Profile updated! Confirmation emails sent to both addresses.");
            } else {
                toast.success("Profile updated successfully!");
                // Refresh local profile state
                setProfile({ ...profile, full_name: fullName });
            }

        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setPasswordUpdating(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success("Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setPasswordUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const initials = fullName ?
        fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) :
        email.slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center gap-4">
                    <Link href="/student/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                        <p className="text-muted-foreground">Manage your personal information and account settings.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Side: Navigation/Info */}
                    <div className="space-y-6">
                        <Card className="glass-panel overflow-hidden border-primary/10">
                            <CardHeader className="bg-primary/5 pb-8 flex flex-col items-center">
                                <Avatar className="h-20 w-20 border-4 border-background shadow-xl mb-4">
                                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-center">{fullName || "Student"}</CardTitle>
                                <CardDescription className="text-center">{email}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <nav className="space-y-1">
                                    {/* Navigation removed as per request */}
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side: Forms */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Info Form */}
                        <form onSubmit={handleUpdateProfile}>
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>
                                        Update your name and identification details.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Your full name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <p className="text-[11px] text-muted-foreground italic">
                                            Changing your email will require re-verification.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/30 border-t pt-6">
                                    <Button type="submit" className="ml-auto" disabled={updating}>
                                        {updating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving Changes...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>

                        {/* Password Change Form */}
                        <form onSubmit={handlePasswordUpdate}>
                            <Card className="shadow-lg border-t-4 border-t-amber-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-amber-500" />
                                        Security Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Update your account password to keep your portal secure.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/30 border-t pt-6">
                                    <Button type="submit" className="ml-auto bg-amber-600 hover:bg-amber-700" disabled={passwordUpdating}>
                                        {passwordUpdating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating Password...
                                            </>
                                        ) : (
                                            "Update Password"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
