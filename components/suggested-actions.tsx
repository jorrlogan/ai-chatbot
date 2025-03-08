'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { GiPoliceBadge } from 'react-icons/gi';
import { BiPlusMedical } from 'react-icons/bi';
import { FaAddressCard } from 'react-icons/fa';
import { IoReceipt } from 'react-icons/io5';
import { RxIdCard } from 'react-icons/rx';
import { MdQuestionMark } from 'react-icons/md';

import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      icon: <BiPlusMedical />,
      title: 'Medical Record',
      label: 'for...',
      action: 'What are the advantages of using Next.js?',
    },
    {
      icon: <IoReceipt />,
      title: 'Medical Bill',
      label: `for...`,
      action: `Write code to demonstrate djikstra's algorithm`,
    },
    {
      icon: <GiPoliceBadge />,
      title: 'Police Report',
      label: `for...`,
      action: `Help me write an essay about silicon valley`,
    },
    {
      icon: <FaAddressCard />,
      title: 'Drivers License',
      label: `for...`,
      action: 'What is the weather in San Francisco?',
    },
    {
      icon: <RxIdCard />,
      title: 'Health Insurance Card',
      label: `for...`,
      action: 'What is the weather in San Francisco?',
    },
    {
      icon: <MdQuestionMark />,
      title: 'Miscellaneous',
      label: `for...`,
      action: 'What is the weather in San Francisco?',
    },
  ];

  return (
    <div className="w-full grid sm:grid-cols-3 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-60 h-36 justify-end items-start"
          >
            {suggestedAction.icon}
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
