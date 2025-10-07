import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../DashboardLayout";
import { router, Link } from "@inertiajs/react";

interface Restaurant {
  id: number;
  name: string;
  location: string;
  cuisine_type: string;
  contact_phone: string;
  contact_email: string;
  main_image: string;
  is_active: boolean; // Now it's required since you have the field
  created_at: string;
  awards_count: number;
}

interface PaginatedRestaurants {
  data: Restaurant[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: any[];
}

interface Props {
  restaurants: PaginatedRestaurants;
  filters: {
    search?: string;
    status?: string;
  };
}

const RestaurantsManage: React.FC<Props> = ({ restaurants: initialRestaurants, filters }) => {
  // Use the data array from paginated response - no need for fallbacks since field exists
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants.data || []);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    (filters.status as "all" | "active" | "inactive") || "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "cuisine">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedRestaurants, setSelectedRestaurants] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);

  // Update restaurants when props change
  useEffect(() => {
    setRestaurants(initialRestaurants.data || []);
    setSearchTerm(filters.search || "");
    setStatusFilter((filters.status as "all" | "active" | "inactive") || "all");
  }, [initialRestaurants, filters]);

  // Filter and sort restaurants
  const filteredRestaurants = restaurants
    .filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" ||
                           (statusFilter === "active" && restaurant.is_active) ||
                           (statusFilter === "inactive" && !restaurant.is_active);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "cuisine":
          aValue = a.cuisine_type.toLowerCase();
          bValue = b.cuisine_type.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Select/deselect all restaurants
  const toggleSelectAll = () => {
    if (selectedRestaurants.length === filteredRestaurants.length) {
      setSelectedRestaurants([]);
    } else {
      setSelectedRestaurants(filteredRestaurants.map(r => r.id));
    }
  };

  // Toggle individual restaurant selection
  const toggleRestaurantSelection = (id: number) => {
    setSelectedRestaurants(prev =>
      prev.includes(id)
        ? prev.filter(restaurantId => restaurantId !== id)
        : [...prev, id]
    );
  };

  // Toggle restaurant status - NOW PROPERLY SAVES TO DATABASE
  const toggleRestaurantStatus = (restaurant: Restaurant) => {
    const newStatus = !restaurant.is_active;

    router.patch(route("restaurants.update-status", restaurant.id), {
      is_active: newStatus
    }, {
      onSuccess: () => {
        // Update local state to reflect the change
        setRestaurants(prev =>
          prev.map(r =>
            r.id === restaurant.id ? { ...r, is_active: newStatus } : r
          )
        );
      }
    });
  };

  // Open delete confirmation modal
  const confirmDelete = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setIsDeleteModalOpen(true);
  };

  // Delete restaurant
  const deleteRestaurant = () => {
    if (restaurantToDelete) {
      router.delete(route("restaurants.destroy", restaurantToDelete.id), {
        onSuccess: () => {
          setRestaurants(prev => prev.filter(r => r.id !== restaurantToDelete.id));
          setIsDeleteModalOpen(false);
          setRestaurantToDelete(null);
        }
      });
    }
  };

  // Bulk actions - NOW PROPERLY SAVES TO DATABASE
  const bulkActivate = () => {
    router.patch(route("restaurants.bulk-update-status"), {
      is_active: true,
      restaurant_ids: selectedRestaurants
    }, {
      onSuccess: () => {
        setRestaurants(prev =>
          prev.map(r =>
            selectedRestaurants.includes(r.id) ? { ...r, is_active: true } : r
          )
        );
        setSelectedRestaurants([]);
      }
    });
  };

  const bulkDeactivate = () => {
    router.patch(route("restaurants.bulk-update-status"), {
      is_active: false,
      restaurant_ids: selectedRestaurants
    }, {
      onSuccess: () => {
        setRestaurants(prev =>
          prev.map(r =>
            selectedRestaurants.includes(r.id) ? { ...r, is_active: false } : r
          )
        );
        setSelectedRestaurants([]);
      }
    });
  };

  const bulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedRestaurants.length} restaurants?`)) {
      router.delete(route("restaurants.bulk-delete"), {
        data: { restaurant_ids: selectedRestaurants },
        onSuccess: () => {
          setRestaurants(prev => prev.filter(r => !selectedRestaurants.includes(r.id)));
          setSelectedRestaurants([]);
        }
      });
    }
  };

  // Handle search with Inertia
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route("restaurants.manage"), {
      search: searchTerm,
      status: statusFilter === "all" ? null : statusFilter
    }, {
      preserveState: true,
      replace: true
    });
  };

  // Handle filter changes
  const handleFilterChange = (newStatusFilter: "all" | "active" | "inactive") => {
    setStatusFilter(newStatusFilter);
    router.get(route("restaurants.manage"), {
      search: searchTerm,
      status: newStatusFilter === "all" ? null : newStatusFilter
    }, {
      preserveState: true,
      replace: true
    });
  };

  // Count active/inactive restaurants - NOW USING ACTUAL DATABASE VALUES
  const activeCount = restaurants.filter(r => r.is_active).length;
  const inactiveCount = restaurants.filter(r => !r.is_active).length;

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manage Restaurants</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your restaurant listings, update status, and view analytics
              </p>
            </div>
            <Link
              href={route("restaurants.add")}
              className="px-6 py-3 bg-primary text-gray-900 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            >
              Add New Restaurant
            </Link>
          </div>
        </div>

        {/* Stats Cards - NOW SHOWING REAL DATABASE COUNTS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{initialRestaurants.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{inactiveCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Awards</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {restaurants.reduce((sum, r) => sum + r.awards_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants by name, location, or cuisine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value as "all" | "active" | "inactive")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="cuisine">Sort by Cuisine</option>
                <option value="created_at">Sort by Date</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              >
                {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Bulk Actions */}
        {selectedRestaurants.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 dark:text-blue-200">
                {selectedRestaurants.length} restaurant(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={bulkActivate}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  Activate
                </button>
                <button
                  onClick={bulkDeactivate}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                >
                  Deactivate
                </button>
                <button
                  onClick={bulkDelete}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restaurants Table - NOW DISPLAYING REAL DATABASE STATUS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRestaurants.length === filteredRestaurants.length && filteredRestaurants.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cuisine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Awards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRestaurants.includes(restaurant.id)}
                        onChange={() => toggleRestaurantSelection(restaurant.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={restaurant.main_image ? `/storage/${restaurant.main_image}` : '/images/restaurant-placeholder.jpg'}
                            alt={restaurant.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {restaurant.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {restaurant.cuisine_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div>{restaurant.contact_phone}</div>
                      <div className="text-gray-500 dark:text-gray-400">{restaurant.contact_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        restaurant.awards_count > 0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {restaurant.awards_count} awards
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRestaurantStatus(restaurant)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          restaurant.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {restaurant.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(restaurant.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={route("restaurants.edit", restaurant.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </Link>
                        <Link
                          href={route("restaurants.show", restaurant.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => confirmDelete(restaurant)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No restaurants found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "Get started by creating a new restaurant."
                }
              </p>
              <div className="mt-6">
                <Link
                  href={route("restaurants.add")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Add New Restaurant
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {initialRestaurants.last_page > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{initialRestaurants.from}</span> to <span className="font-medium">{initialRestaurants.to}</span> of{' '}
                    <span className="font-medium">{initialRestaurants.total}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  {/* Previous Page */}
                  {initialRestaurants.current_page > 1 && (
                    <Link
                      href={route("restaurants.manage", {
                        page: initialRestaurants.current_page - 1,
                        search: filters.search,
                        status: filters.status
                      })}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Previous
                    </Link>
                  )}

                  {/* Page Numbers */}
                  {Array.from({ length: initialRestaurants.last_page }, (_, i) => i + 1).map(page => (
                    <Link
                      key={page}
                      href={route("restaurants.manage", {
                        page,
                        search: filters.search,
                        status: filters.status
                      })}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                        page === initialRestaurants.current_page
                          ? 'z-10 bg-primary border-primary text-gray-900'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </Link>
                  ))}

                  {/* Next Page */}
                  {initialRestaurants.current_page < initialRestaurants.last_page && (
                    <Link
                      href={route("restaurants.manage", {
                        page: initialRestaurants.current_page + 1,
                        search: filters.search,
                        status: filters.status
                      })}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && restaurantToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mt-2">
                  Delete Restaurant
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete "{restaurantToDelete.name}"? This action cannot be undone.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={deleteRestaurant}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RestaurantsManage;
