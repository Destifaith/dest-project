import React from 'react';
import DashboardLayout from '../../../../DashboardLayout';
import { Link, router, usePage } from '@inertiajs/react';

interface Eatery {
    id: number;
    name: string;
    location: string;
    eatery_type: string;
    cuisine_type: string;
    status: 'pending' | 'approved' | 'rejected';
    main_image?: string;
    contact_phone: string;
    contact_email?: string;
    created_at: string;
}

interface Props {
    eateries: {
        data: Eatery[];
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const EateriesManage: React.FC<Props> = ({ eateries, filters }) => {
    const { url } = usePage();

    const handleSearch = (search: string) => {
        router.get('/dashboard/food/eateries/manage', { search }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/dashboard/food/eateries/manage', { status }, { preserveState: true });
    };

    const clearFilters = () => {
        router.get('/dashboard/food/eateries/manage', {}, { preserveState: true });
    };

    const handleDelete = (eateryId: number) => {
        if (confirm('Are you sure you want to delete this eatery?')) {
            router.delete(`/dashboard/food/eateries/${eateryId}`);
        }
    };

    const handleStatusUpdate = (eateryId: number, newStatus: string) => {
        router.patch(`/dashboard/food/eateries/${eateryId}/status`, { status: newStatus });
    };

    return (
        <DashboardLayout>
            <div className="px-4 lg:px-8 xl:px-12">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Manage Eateries
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                View and manage all eateries in the system
                            </p>
                        </div>
                        <Link
                            href="/dashboard/food/eateries/add"
                            className="bg-primary text-gray-800 px-6 py-3 rounded-lg hover:bg-primary/90 font-medium"
                        >
                            Add New Eatery
                        </Link>
                    </div>
                </div>
 {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{eateries.data.length}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Eateries</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {eateries.data.filter(e => e.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {eateries.data.filter(e => e.status === 'approved').length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {eateries.data.filter(e => e.status === 'rejected').length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Rejected</div>
                    </div>
                </div>
                {/* Filters */}
                <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search eateries by name, location, or cuisine..."
                                defaultValue={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            />
                        </div>
                        <div>
                            <select
                                defaultValue={filters.status || ''}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        {(filters.search || filters.status) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Eateries Table */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Eatery
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type & Cuisine
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {eateries.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No eateries found. {filters.search || filters.status ? 'Try adjusting your filters.' : 'Start by adding your first eatery.'}
                                        </td>
                                    </tr>
                                ) : (
                                    eateries.data.map((eatery) => (
                                        <tr key={eatery.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {eatery.main_image && (
                                                        <img
                                                            src={`/storage/${eatery.main_image}`}
                                                            alt={eatery.name}
                                                            className="h-10 w-10 rounded-lg object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {eatery.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {eatery.location}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">{eatery.eatery_type}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{eatery.cuisine_type || 'Not specified'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">{eatery.contact_phone}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{eatery.contact_email || 'No email'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        eatery.status === 'approved'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : eatery.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}>
                                                        {eatery.status}
                                                    </span>
                                                    <select
                                                        value={eatery.status}
                                                        onChange={(e) => handleStatusUpdate(eatery.id, e.target.value)}
                                                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(eatery.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={`/dashboard/food/eateries/${eatery.id}`}
                                                        className="text-primary hover:text-primary/80 px-3 py-1 rounded border border-transparent hover:border-primary/20"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/food/eateries/${eatery.id}/edit`}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1 rounded border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(eatery.id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 px-3 py-1 rounded border border-transparent hover:border-red-200 dark:hover:border-red-800"
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
                    {eateries.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <nav className="flex items-center justify-between">
                                <div className="flex justify-between flex-1">
                                    {eateries.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => router.get(link.url || '#')}
                                            disabled={!link.url}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                                                link.active
                                                    ? 'z-10 bg-primary text-gray-800 border-primary'
                                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            } rounded-md mx-1`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </nav>
                        </div>
                    )}
                </div>


            </div>
        </DashboardLayout>
    );
};

export default EateriesManage;
