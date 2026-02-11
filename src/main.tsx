import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/context/ThemeContext";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { TournamentsPage } from "./pages/TournamentsPage";
import { TeamsPage } from "./pages/TeamsPage";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="tournaments" element={<TournamentsPage />} />
                            <Route path="teams" element={<TeamsPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
                <Toaster />
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>
);

