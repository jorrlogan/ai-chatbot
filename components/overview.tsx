import { motion } from 'framer-motion';
import type { CreateMessage } from 'ai';
import { SuggestedActions } from './suggested-actions';

export const Overview = ({ chatId, append }: { chatId: string, append: (message: CreateMessage) => Promise<string | null | undefined> }) => {
  return (
    <motion.div
      key="overview"
      className="max-w-5xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-4xl">
        <p className="text-3xl font-bold">What documents can I help with?</p>
        <SuggestedActions chatId={chatId} append={append} />
      </div>
    </motion.div>
  );
};
