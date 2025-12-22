import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[100px] pointer-events-none"></div>

            <Card className="w-full max-w-md glass-panel border-white/10 shadow-2xl z-10">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your portal.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="student" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                            <TabsTrigger value="student">Student</TabsTrigger>
                            <TabsTrigger value="teacher">Teacher</TabsTrigger>
                            <TabsTrigger value="org">Admin</TabsTrigger>
                        </TabsList>

                        {/* Student Login Form */}
                        <TabsContent value="student">
                            <form className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="s-email">Student ID or Email</Label>
                                    <Input id="s-email" placeholder="student@example.com" className="bg-white/5 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="s-password">Password</Label>
                                    <Input id="s-password" type="password" className="bg-white/5 border-white/10" />
                                </div>
                                <Link href="/student/dashboard">
                                    <Button type="button" className="w-full mt-2">Login as Student</Button>
                                </Link>
                            </form>
                        </TabsContent>

                        {/* Teacher Login Form */}
                        <TabsContent value="teacher">
                            <form className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="t-email">Instructor Email</Label>
                                    <Input id="t-email" placeholder="teacher@darus.com" className="bg-white/5 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="t-password">Password</Label>
                                    <Input id="t-password" type="password" className="bg-white/5 border-white/10" />
                                </div>
                                <Link href="/teacher/dashboard">
                                    <Button type="button" className="w-full mt-2" variant="secondary">Login as Instructor</Button>
                                </Link>
                            </form>
                        </TabsContent>

                        {/* Org Login Form */}
                        <TabsContent value="org">
                            <form className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="o-email">Organization ID</Label>
                                    <Input id="o-email" placeholder="admin@org.com" className="bg-white/5 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="o-password">Password</Label>
                                    <Input id="o-password" type="password" className="bg-white/5 border-white/10" />
                                </div>
                                <Link href="/organization/dashboard">
                                    <Button type="button" className="w-full mt-2" variant="outline">Access Admin Panel</Button>
                                </Link>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-white/5 py-4">
                    <p className="text-xs text-muted-foreground">
                        Don't have an account? <Link href="#" className="underline hover:text-primary">Apply for inscription</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
