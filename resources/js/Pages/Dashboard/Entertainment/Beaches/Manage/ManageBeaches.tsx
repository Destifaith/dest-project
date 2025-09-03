import React, { useState } from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { Inertia } from "@inertiajs/inertia";
import { router, usePage } from "@inertiajs/react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { PageProps } from "@/types"; // ✅ added import

// Beach interface
export interface Beach {
  id: number;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  location: string;
  sand_type: string;
  water_type: string;
  facilities: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  main_image: {
    id: number;
    beach_id: number;
    image_path: string;
    type: string;
    created_at: string;
    updated_at: string;
  };
  gallery_images: {
    id: number;
    beach_id: number;
    image_path: string;
    type: string;
    created_at: string;
    updated_at: string;
  }[];
}

interface Props {
  beaches: {
    data: Beach[];
    links: { label: string; url: string | null; active: boolean }[];
  };
}

const ManageBeaches: React.FC = () => {
  const { beaches } = usePage<PageProps & { beaches: Props["beaches"] }>().props;
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    router.get(
      "/dashboard/entertainment/beaches/manage",
      { search: e.target.value },
      { preserveState: true, replace: true }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this beach?")) {
      Inertia.delete(route("beaches.destroy", id));
    }
  };

  const togglePublic = (id: number, currentValue: boolean) => {
    Inertia.put(route("beaches.togglePublic", id), {
      is_public: currentValue ? 0 : 1,
    });
  };

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Manage Beaches
        </h1>

        {/* Search input */}
        <div className="mt-4 mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or location..."
            className="w-full md:w-1/3 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Beaches Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sand Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Water Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Public
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {beaches?.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-300"
                  >
                    No beaches found.
                  </td>
                </tr>
              ) : (
                beaches.data.map((beach: Beach) => ( // ✅ typed beach
                  <tr key={beach.id}>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 whitespace-normal break-words">
                      {beach.name}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 whitespace-normal break-words">
                      {beach.location}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 whitespace-normal break-words">
                      {beach.sand_type}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 whitespace-normal break-words">
                      {beach.water_type}
                    </td>

                    {/* Toggle switch for public */}
                    <td className="px-6 py-4 whitespace-normal break-words">
                      <label className="inline-flex relative items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={beach.is_public}
                          onChange={() =>
                            togglePublic(beach.id, beach.is_public)
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {beach.is_public ? "Public" : "Not Public"}
                        </span>
                      </label>
                    </td>

                    <td className="px-6 py-4 text-gray-500 dark:text-gray-300 whitespace-normal break-words">
                      {beach.created_at}
                    </td>

                    {/* Action icons vertically */}
                    <td className="px-6 py-4 text-center space-y-2 flex flex-col items-center">
                      <a
                        href={route("beaches.show", beach.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        title="View"
                      >
                        <Eye size={20} />
                      </a>
                      <a
                        href={route("beaches.edit", beach.id)}
                        className="text-yellow-600 dark:text-yellow-400 hover:underline"
                        title="Edit"
                      >
                        <Pencil size={20} />
                      </a>
                      <button
                        onClick={() => handleDelete(beach.id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {beaches?.links && (
          <div className="mt-4 flex justify-end space-x-2">
            {beaches.links.map(
              (
                link: { label: string; url: string | null; active: boolean },
                index: number // ✅ typed link + index
              ) => (
                <button
                  key={index}
                  disabled={!link.url}
                  onClick={() =>
                    link.url && router.get(link.url, {}, { preserveState: true })
                  }
                  className={`px-3 py-1 rounded-md border ${
                    link.active
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              )
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageBeaches;
