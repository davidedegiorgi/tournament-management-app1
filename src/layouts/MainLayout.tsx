import { Outlet } from "react-router";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Trophy } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export function MainLayout() {
    const { theme, toggleTheme } = useTheme();

    return (
        <main className="min-h-screen relative overflow-hidden bg-white dark:bg-transparent">
        
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Dark mode - solid blue */}
                <div className="absolute inset-0 dark:bg-[#0a1442] bg-slate-50 transition-colors" />
            </div>

            {/* Theme Toggle Button */}
            <div className="absolute top-4 right-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-full bg-white dark:bg-[#1B3A8F]/90 backdrop-blur-sm border-slate-300 dark:border-[#00C8FF]/20 hover:border-slate-400 dark:hover:border-[#00C8FF]/50 transition-all shadow-sm"
                >
                    {theme === "dark" ? (
                        <Sun className="size-5 text-[#00C8FF]" />
                    ) : (
                        <Moon className="size-5 text-[#0E1E5B]" />
                    )}
                </Button>
            </div>

            <div className="container mx-auto py-8 px-4 relative">
                <div className="space-y-6">
                    {/* Header */}
                    <header className="animate-slide-up relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="relative">
                                    <div
                                        className="size-12 sm:size-16 rounded-2xl flex items-center justify-center shadow-lg animate-trophy-glow"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #00C8FF 0%, #0099CC 100%)",
                                        }}
                                    >
                                        <Trophy className="size-6 sm:size-8 text-white dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0E1E5B] dark:text-white">
                                        Tournament{" "}
                                        <span className="text-[#00C8FF]">Manager</span>
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Navigation */}
                    <Navigation />

                    {/* Page Content */}
                    <Outlet />
                </div>
            </div>
        </main>
    );
}
