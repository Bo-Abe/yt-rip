import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        className="h-12 w-12 rounded-full border-2 border-brand-400/30 border-t-brand-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
