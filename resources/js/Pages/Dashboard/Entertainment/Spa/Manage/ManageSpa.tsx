import React, { useState } from 'react';
import DashboardLayout from "../../../../DashboardLayout";
import { router, Link } from '@inertiajs/react';
import { Spa } from '../../../../../types';

interface Props {
  spas: {
    data: Spa[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  filters: {
    search?: string;
  };
}

const ManageSpa: React.FC<Props> = ({ spas, filters }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedSpas, setSelectedSpas] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/dashboard/entertainment/spa/manage', { search }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSpas(spas.data.map(spa => spa.id));
    } else {
      setSelectedSpas([]);
    }
  };

  const handleSelectSpa = (id: number) => {
    if (selectedSpas.includes(id)) {
      setSelectedSpas(selectedSpas.filter(spaId => spaId !== id));
    } else {
      setSelectedSpas([...selectedSpas, id]);
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/spas/${id}`, {
      onSuccess: () => {
        setDeleteConfirm(null);
        setSelectedSpas(selectedSpas.filter(spaId => spaId !== id));
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedSpas.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedSpas.length} spa(s)?`)) {
      selectedSpas.forEach(id => {
        router.delete(`/spas/${id}`, {
          onSuccess: () => {
            setSelectedSpas([]);
          },
          preserveScroll: true,
        });
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Spas</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View, edit, and manage all spas in your system
            </p>
          </div>
          <Link
            href="/dashboard/entertainment/spa/add"
            className="mt-4 sm:mt-0 px-4 py-2 bg-primary text-gray-700 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          >
            Add New Spa
          </Link>
        </div>

        {/* Search and Bulk Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Search spas by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Search
              </button>
            </form>

            {selectedSpas.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSpas.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Spas Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-8">
                    <input
                      type="checkbox"
                      checked={selectedSpas.length === spas.data.length && spas.data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-primary focus:ring-primary dark:bg-gray-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Spa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Treatment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {spas.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {filters.search ? (
                        <>No spas found matching "{filters.search}"</>
                      ) : (
                        <>No spas found. <Link href="/dashboard/entertainment/spa/add" className="text-primary hover:underline">Add your first spa</Link></>
                      )}
                    </td>
                  </tr>
                ) : (
                  spas.data.map((spa) => (
                    <tr key={spa.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSpas.includes(spa.id)}
                          onChange={() => handleSelectSpa(spa.id)}
                          className="rounded text-primary focus:ring-primary dark:bg-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={spa.main_image ? `/storage/${spa.main_image}` : '/images/placeholder-spa.jpg'}
                              alt={spa.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {spa.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {spa.treatment_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{spa.location}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {spa.latitude}, {spa.longitude}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {spa.treatment_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {spa.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          spa.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {spa.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/entertainment/spa/${spa.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(spa.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {spas.last_page > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{spas.from}</span> to{' '}
                    <span className="font-medium">{spas.to}</span> of{' '}
                    <span className="font-medium">{spas.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {spas.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.url || '#'}
                        preserveState
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          link.active
                            ? 'z-10 bg-primary border-primary text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        } ${index === 0 ? 'rounded-l-md' : ''} ${
                          index === spas.links.length - 1 ? 'rounded-r-md' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this spa? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageSpa;
