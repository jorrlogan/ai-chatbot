'use client';
import type { User } from '@/app/(auth)/auth';
import { getOrg, updateOrg } from '@/app/(settings)/actions';
import { useState, useEffect } from 'react';
import type { Org } from '@/lib/db/schema';
import { BuildingOfficeIcon } from '@heroicons/react/24/solid';

export default function Organization({ user }: { user: User }) {
  const [org, setOrg] = useState<Org | null>(null);

  useEffect(() => {
    if (user.orgId) {
      getOrg(user.orgId).then(setOrg);
    }
  }, [user.orgId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const orgName = formData.get('org-name') as string;
    const orgLogo = formData.get('org-logo') as File;
    if (user.orgId) {
      updateOrg(user.orgId, orgName, orgLogo);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className=" pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Organization
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information will be displayed when users login to the app.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label
                htmlFor="org-name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Organization Name
              </label>
              <div className="mt-2">
                <input
                  id="org-name"
                  name="org-name"
                  type="text"
                  defaultValue={org?.name}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="org-logo"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Organization Logo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <BuildingOfficeIcon
                    className="mx-auto size-12 text-gray-300"
                    aria-hidden="true"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-600">
                    <label
                      htmlFor="org-logo"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="org-logo"
                        name="org-logo"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs/5 text-gray-600">PNG, JPG up to 5MB</p>
                </div>
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
