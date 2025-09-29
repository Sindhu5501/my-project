import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";

const Toast = () => {
  const { currentToast, showToast, hideToast } = useNotifications();
  
  useEffect(() => {
    if (showToast && currentToast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [showToast, currentToast, hideToast]);

  return (
    <AnimatePresence>
      {showToast && currentToast && (
        <div className="fixed bottom-5 right-5 z-50">
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-xl rounded-lg overflow-hidden w-72 mb-3 border border-gray-200"
          >
            <div className="bg-primary-50 px-4 py-2 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-primary-700">New Notification</h4>
                <button 
                  className="text-gray-400 hover:text-gray-500"
                  onClick={hideToast}
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">{currentToast.message}</p>
              <div className="mt-3 flex justify-end">
                <button 
                  className="text-xs text-primary-600 hover:text-primary-800"
                  onClick={hideToast}
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
