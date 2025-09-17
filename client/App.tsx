import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import Placeholder from "./pages/Placeholder";
import Turlar from "./pages/Turlar";
import TurDetay from "./pages/TurDetay";
import Videolar from "./pages/Videolar";
import YatKiralama from "./pages/YatKiralama";
import YatDetay from "./pages/YatDetay";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/turlar" element={<Turlar />} />
              <Route path="/turlar/:id" element={<TurDetay />} />
              <Route path="/transferler" element={<Placeholder />} />
              <Route path="/videolar" element={<Videolar />} />
              <Route path="/yat-kiralama" element={<YatKiralama />} />
              <Route path="/yat-kiralama/:id" element={<YatDetay />} />
              <Route path="/ucak-bileti" element={<Placeholder />} />
              <Route path="/otobus-bileti" element={<Placeholder />} />
              <Route path="/destek" element={<Placeholder />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
