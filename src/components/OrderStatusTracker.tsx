import { motion } from "framer-motion";
import { Clock, CheckCircle2, Package, Truck, MapPin, XCircle } from "lucide-react";

export type OrderStatus = "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

interface OrderStatusTrackerProps {
  status: OrderStatus;
}

const STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "processing", label: "Processing", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Package },
  { key: "out_for_delivery", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

export const OrderStatusTracker = ({ status }: OrderStatusTrackerProps) => {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600">
        <XCircle size={20} />
        <span className="font-bold uppercase tracking-widest text-xs">Order Cancelled</span>
      </div>
    );
  }

  const currentStep = STEPS.findIndex(s => s.key === status);

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-stone-100 -z-10" />
        <motion.div 
          className="absolute top-5 left-0 h-[2px] bg-gold -z-10"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "circOut" }}
        />

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center gap-3 relative">
              <motion.div 
                initial={false}
                animate={{ 
                  backgroundColor: isCompleted ? "#D4AF37" : "#F5F5F4",
                  scale: isCurrent ? 1.2 : 1
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                  isCompleted ? "border-gold/20" : "border-stone-50"
                } shadow-sm transition-colors duration-500`}
              >
                <Icon size={18} className={isCompleted ? "text-white" : "text-stone-300"} />
              </motion.div>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                  isCompleted ? "text-stone-900" : "text-stone-400"
                }`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <motion.span 
                    layoutId="currentStep"
                    className="w-1 h-1 rounded-full bg-gold"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
