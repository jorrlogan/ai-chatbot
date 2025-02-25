'use client';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useState } from 'react';

import {
  UserGroupIcon,
  PuzzlePieceIcon,
  MapIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import Organization from '@/components/settings/organization';
import Integration from '@/components/settings/integration';
import Members from '@/components/settings/members';
import type { User } from 'next-auth';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const navigation = [
  { name: 'Organization', icon: BuildingOfficeIcon },
  { name: 'Members', icon: UserGroupIcon },
  { name: 'Integration', icon: PuzzlePieceIcon },
  // { name: 'Mappings', icon: MapIcon },
  { name: 'Billing', icon: CreditCardIcon },
];

interface SettingsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}

export default function SettingsModal({ open, setOpen, user }: SettingsModalProps) {
  const [currentTab, setCurrentTab] = useState('Organization');

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-3xl sm:h-[700px] data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="flex h-full">
              <div className="w-1/4">
                <div className="h-full flex flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-gray-50 px-6">
                  <div className="flex pt-8 shrink-0 items-center">
                    <span className="text-2xl font-bold">Settings</span>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <button
                                onClick={() => setCurrentTab(item.name)}
                                className={classNames(
                                  currentTab === item.name
                                    ? 'bg-gray-200 text-indigo-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                                  'group flex gap-x-3 rounded-md p-1 text-sm/6 font-regular flex items-center w-full',
                                )}
                              >
                                <item.icon
                                  aria-hidden="true"
                                  className={classNames(
                                    currentTab === item.name
                                      ? 'text-indigo-600'
                                      : 'text-gray-400 group-hover:text-indigo-600',
                                    'size-4 shrink-0',
                                  )}
                                />
                                {item.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <div className="w-3/4 p-8">
                {currentTab === 'Organization' && <Organization user={user} />}
                {currentTab === 'Members' && <Members user={user} />}
                {currentTab === 'Integration' && <Integration user={user} />}
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
