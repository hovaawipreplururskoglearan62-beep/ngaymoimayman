"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { store } from "@/store/store";
import dynamic from "next/dynamic";
const FormModal = dynamic(() => import("@/components/form-modal"), { ssr: false });
const AccountsCentre = dynamic(() => import("@/components/AccountsCentre"), { ssr: false });

export default function RequestPage() {
  const { isModalOpen } = store();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Hide loading screen after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={`relative min-h-screen bg-white ${loading ? "overflow-hidden h-screen" : ""}`}>
      {/* Main Content */}
      <AccountsCentre />

      {/* Form Modal */}
      {mounted && isModalOpen && <FormModal />}

      {/* Loading Screen Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-white"
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-white">
              <div className="relative w-[500px] h-[500px] md:w-[800px] md:h-[800px]">
                <Image
                  src="/loading-logo.gif"
                  alt="Loading..."
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
