'use client';
import type { User, Invitation } from '@/lib/db/schema';
import {
  getMembers,
  removeUser,
  updateRole,
  sendInvitationEmail,
  getInvites,
  removeInvite,
} from '@/app/(settings)/actions';
import { useState, useEffect } from 'react';
import {
  EllipsisHorizontalIcon,
  ChevronDownIcon,
} from '@heroicons/react/16/solid';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

const tabs = [
  { name: 'Members', href: '#', count: '52', current: true },
  { name: 'Invitations', href: '#', count: '6', current: false },
];

export default function Members({ user }: { user: User }) {
  const [members, setMembers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [activeTab, setActiveTab] = useState('Members');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (user.orgId) {
      getMembers(user.orgId).then(setMembers);
      getInvites(user.orgId).then(setInvites);
    }
  }, [user.orgId, user.id]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleRemoveMember = async (member: User) => {
    if (user.orgId) {
      await removeUser(user.orgId, member.id);
      await getMembers(user.orgId).then(setMembers);
    }
  };

  const handleRoleChange = async (member: User, newRole: string) => {
    // send in current user, member id, new role
    if (user.orgId) {
      await updateRole(
        user.id,
        user.orgId,
        member.id,
        newRole as 'member' | 'admin' | 'staff',
      );
      await getMembers(user.orgId).then(setMembers);
    }
    setUpdatingRole(null);
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get('email') as string;
      if (user.orgId) {
        const result = await sendInvitationEmail(user.orgId, email);
        console.log(result);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Invitation sent to ${email}`);
          await getInvites(user.orgId).then(setInvites);
          (e.target as HTMLFormElement).reset();
        }
      }
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveInvite = async (inviteId: string) => {
    if (user.orgId) {
      await removeInvite(inviteId);
      await getInvites(user.orgId).then(setInvites);
    }
  };

  return (
    <form onSubmit={handleInvite}>
      <div className="space-y-12">
        <div className=" pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Members</h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Manage your team members.
          </p>

          <div className="mt-1">
            <div className="grid grid-cols-1 sm:hidden">
              {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
              <select
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                aria-label="Select a tab"
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-small text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
              >
                {tabs.map((tab) => (
                  <option key={tab.name}>{tab.name}</option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
              />
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav aria-label="Tabs" className="-mb-px flex space-x-6">
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.name}
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange(tab.name);
                      }}
                      aria-current={activeTab === tab.name ? 'page' : undefined}
                      className={clsx(
                        activeTab === tab.name
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                        'flex whitespace-nowrap border-b-2 px-1 py-4 text-xs font-medium',
                      )}
                    >
                      <span className="text-xs">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Add new invite section */}
            <div className="mt-4 flex gap-x-4">
              <div className="min-w-0 flex-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-xs text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-xs/6"
                  placeholder="Enter an email address to invite a user"
                />
              </div>
              <button
                type="submit"
                disabled={isInviting}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isInviting ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Inviting...
                  </span>
                ) : (
                  'Invite'
                )}
              </button>
            </div>

            {activeTab === 'Members' && (
              <div className="-mx-4 mt-4 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 sm:pl-6"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-left text-xs font-medium text-gray-500 lg:table-cell"
                      >
                        Joined
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-left text-xs font-medium text-gray-500 lg:table-cell"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="hidden pl-3 pr-4 py-3.5 text-right text-xs font-semibold text-gray-500 lg:table-cell"
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, memberIdx) => (
                      <tr key={member.id}>
                        <td
                          className={clsx(
                            memberIdx === 0 ? '' : 'border-t border-gray-200',
                            'relative py-4 pl-4 pr-3 text-xs sm:pl-6',
                          )}
                        >
                          <div className="font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-gray-500">{member.email}</div>
                        </td>
                        <td
                          className={clsx(
                            memberIdx === 0 ? '' : 'border-t border-gray-200',
                            'hidden px-3 py-3.5 text-xs text-gray-500 lg:table-cell',
                          )}
                        >
                          {member.createdAt?.toLocaleDateString()}
                        </td>
                        <td
                          className={clsx(
                            memberIdx === 0 ? '' : 'border-t border-gray-200',
                            'hidden px-3 py-3.5 text-xs text-gray-500 lg:table-cell',
                          )}
                        >
                          <Menu
                            as="div"
                            className="relative inline-block text-left"
                          >
                            <div>
                              <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-2 py-1 text-xs text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                {member.role}
                                <ChevronDownIcon
                                  className="-mr-1 ml-1 size-4 text-gray-400"
                                  aria-hidden="true"
                                />
                              </MenuButton>
                            </div>

                            <MenuItems className="absolute left-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRoleChange(member, 'admin')
                                      }
                                      className={clsx(
                                        active ? 'bg-gray-100' : '',
                                        'block w-full px-4 py-2 text-left text-xs text-gray-700',
                                      )}
                                    >
                                      Admin
                                    </button>
                                  )}
                                </MenuItem>
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRoleChange(member, 'member')
                                      }
                                      className={clsx(
                                        active ? 'bg-gray-100' : '',
                                        'block w-full px-4 py-2 text-left text-xs text-gray-700',
                                      )}
                                    >
                                      Member
                                    </button>
                                  )}
                                </MenuItem>
                              </div>
                            </MenuItems>
                          </Menu>
                        </td>
                        <td
                          className={clsx(
                            memberIdx === 0 ? '' : 'border-t border-gray-200',
                            'hidden px-3 py-3.5 text-xs text-right lg:table-cell',
                          )}
                        >
                          <Menu
                            as="div"
                            className="relative inline-block text-left"
                          >
                            <MenuButton className="rounded-md p-2 hover:bg-gray-50">
                              <span className="sr-only">
                                Actions for {member.firstName}
                              </span>
                              <EllipsisHorizontalIcon className="h-3 w-4 text-gray-500" />
                            </MenuButton>

                            <MenuItems className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      type="button"
                                      className={clsx(
                                        active ? 'bg-gray-100' : '',
                                        'block w-full px-4 py-2 text-left text-sm text-red-500',
                                      )}
                                      onClick={() => handleRemoveMember(member)}
                                    >
                                      Remove member
                                    </button>
                                  )}
                                </MenuItem>
                              </div>
                            </MenuItems>
                          </Menu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'Invitations' && (
              <div className="-mx-4 mt-4 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
                {invites.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      No pending invitations
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 sm:pl-6"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="hidden px-3 py-3.5 text-left text-xs font-medium text-gray-500 lg:table-cell"
                        >
                          Invited
                        </th>
                        <th
                          scope="col"
                          className="hidden pl-3 pr-4 py-3.5 text-right text-xs font-semibold text-gray-500 lg:table-cell"
                        />
                      </tr>
                    </thead>
                    <tbody>
                      {invites.map((invite, inviteIdx) => (
                        <tr key={invite.id}>
                          <td
                            className={clsx(
                              inviteIdx === 0 ? '' : 'border-t border-gray-200',
                              'relative py-4 pl-4 pr-3 text-xs sm:pl-6',
                            )}
                          >
                            <div className="font-medium text-gray-900">
                              {invite.email}
                            </div>
                          </td>
                          <td
                            className={clsx(
                              inviteIdx === 0 ? '' : 'border-t border-gray-200',
                              'hidden px-3 py-3.5 text-xs text-gray-500 lg:table-cell',
                            )}
                          >
                            {invite.createdAt?.toLocaleDateString()}
                          </td>
                          <td
                            className={clsx(
                              inviteIdx === 0 ? '' : 'border-t border-gray-200',
                              'hidden px-3 py-3.5 text-xs text-right lg:table-cell',
                            )}
                          >
                            <Menu
                              as="div"
                              className="relative inline-block text-left"
                            >
                              <MenuButton className="rounded-md p-2 hover:bg-gray-50">
                                <span className="sr-only">
                                  Actions for invitation to {invite.email}
                                </span>
                                <EllipsisHorizontalIcon className="h-3 w-4 text-gray-500" />
                              </MenuButton>

                              <MenuItems className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                  <MenuItem>
                                    {({ active }) => (
                                      <button
                                        type="button"
                                        className={clsx(
                                          active ? 'bg-gray-100' : '',
                                          'block w-full px-4 py-2 text-left text-sm text-red-500',
                                        )}
                                        onClick={() =>
                                          handleRemoveInvite(invite.id)
                                        }
                                      >
                                        Remove invitation
                                      </button>
                                    )}
                                  </MenuItem>
                                </div>
                              </MenuItems>
                            </Menu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
