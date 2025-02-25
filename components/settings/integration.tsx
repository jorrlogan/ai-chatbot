'use client';
import type { User } from '@/app/(auth)/auth';
import { getConnection, updateConnection } from '@/app/(settings)/actions';
import { useState, useEffect } from 'react';
import type { Connection } from '@/lib/db/schema';
export default function Integration({ user }: { user: User }) {
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    if (user.orgId) {
      getConnection(user.orgId).then(setConnection);
    }
  }, [user.orgId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const connectionType = 'filevine';
    const baseUrl = formData.get('base-url') as string;
    const apiKey = formData.get('api-key') as string;
    const apiSecret = formData.get('api-secret') as string;
    if (user.orgId) {
      updateConnection(user.orgId, connectionType, baseUrl, apiKey, apiSecret);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Integration
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Connect your case management system.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label
                htmlFor="base-url"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Base URL
              </label>
              <div className="mt-2">
                <input
                  id="base-url"
                  name="base-url"
                  type="text"
                  defaultValue={connection?.baseUrl}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="api-key"
                className="block text-sm/6 font-medium text-gray-900"
              >
                API Key
              </label>
              <div className="mt-2">
                <input
                  id="api-key"
                  name="api-key"
                  type="text"
                  defaultValue={connection?.apiKey}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="api-secret"
                className="block text-sm/6 font-medium text-gray-900"
              >
                API Secret
              </label>
              <div className="mt-2">
                <input
                  id="api-secret"
                  name="api-secret"
                  type="password"
                  defaultValue={connection?.apiSecret}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
    </form>
  );
}
