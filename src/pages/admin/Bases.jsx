import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
// Import API functions
import { getBases, createBase, updateBase, deleteBase, getUsers } from "@/api/dbAdminAPI";
import { toast } from "react-toastify";

const Bases = () => {
  const [allBases, setAllBases] = useState([]); // Store all bases
  const [bases, setBases] = useState([]); // Store filtered bases
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [baseToDelete, setBaseToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false); // State for Add/Edit modal
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentBase, setCurrentBase] = useState({ // State for base data in modal
    wafi_user_id: "",
    wafi_tag: "",
    wafi_name: "",
    wafi_th_level: ""
  });
  const [usersList, setUsersList] = useState([]); // State for users dropdown

  useEffect(() => {
    fetchUsersList(); // Fetch users for the dropdown
    fetchBases();
  }, []);

  // Apply client-side filtering when searchTerm changes
  useEffect(() => {
    if (allBases.length > 0) {
      filterBases();
    }
  }, [searchTerm, allBases]);

  const fetchUsersList = async () => {
    try {
      // Assuming getUsers fetches all users needed for the dropdown
      const data = await getUsers(); // No need for pagination params
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users list:", err);
      toast.error(err.messageWafi || err.message || "Failed to load users for dropdown");
    }
  };

  const fetchBases = async () => {
    try {
      setLoading(true);
      // Use getBases API function without pagination or search parameters
      const data = await getBases();
      const basesData = Array.isArray(data) ? data : [];
      setAllBases(basesData);
      setBases(basesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bases:", err);
      setError(err.messageWafi || err.message || "Failed to load bases data");
      setLoading(false);
      setAllBases([]); // Fallback to empty array
      setBases([]);
    }
  };

  const filterBases = () => {
    if (!searchTerm.trim()) {
      setBases(allBases);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = allBases.filter(base => 
      (base.wafi_tag && base.wafi_tag.toLowerCase().includes(lowerCaseSearch)) ||
      (base.wafi_name && base.wafi_name.toLowerCase().includes(lowerCaseSearch)) ||
      (base.user_name && base.user_name.toLowerCase().includes(lowerCaseSearch))
    );
    setBases(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterBases(); // This is redundant since the useEffect will handle this
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentBase({
      wafi_user_id: usersList.length > 0 ? usersList[0].wafi_id : "", // Default to first user or empty
      wafi_tag: "",
      wafi_name: "",
      wafi_th_level: ""
    });
    setShowModal(true);
  };

  const openEditModal = (base) => {
    setModalMode("edit");
    // Ensure all fields expected by the modal are present
    setCurrentBase({
      wafi_id: base.wafi_id,
      wafi_user_id: base.wafi_user_id,
      wafi_tag: base.wafi_tag,
      wafi_name: base.wafi_name,
      wafi_th_level: base.wafi_th_level
    });
    setShowModal(true);
  };

  const confirmDelete = (base) => {
    setBaseToDelete(base);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      // Use deleteBase API function
      const response = await deleteBase(baseToDelete.wafi_id);
      if (response.successWafi) {
        // Update both arrays
        const updatedBases = allBases.filter(base => base.wafi_id !== baseToDelete.wafi_id);
        setAllBases(updatedBases);
        setBases(updatedBases.filter(base => {
          if (!searchTerm.trim()) return true;
          
          const lowerCaseSearch = searchTerm.toLowerCase();
          return (
            (base.wafi_tag && base.wafi_tag.toLowerCase().includes(lowerCaseSearch)) ||
            (base.wafi_name && base.wafi_name.toLowerCase().includes(lowerCaseSearch)) ||
            (base.user_name && base.user_name.toLowerCase().includes(lowerCaseSearch))
          );
        }));
        setShowDeleteModal(false);
        toast.success(response.messageWafi || "Base deleted successfully");
      } else {
        toast.error(response.messageWafi || "Error deleting base");
      }
    } catch (err) {
      console.error("Error deleting base:", err);
      toast.error(err.messageWafi || err.message || "Error deleting base");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!currentBase.wafi_user_id || !currentBase.wafi_tag || !currentBase.wafi_th_level) {
      toast.error("User, Tag, and TH Level are required.");
      return;
    }
    // Ensure tag starts with #
    const baseDataToSend = {
      ...currentBase,
      wafi_tag: currentBase.wafi_tag.startsWith('#') ? currentBase.wafi_tag : `#${currentBase.wafi_tag}`
    };

    try {
      let response;
      if (modalMode === "add") {
        // Use createBase API function
        response = await createBase(baseDataToSend);
        if (response.successWafi) {
          fetchBases(); // Refetch all bases
          toast.success(response.messageWafi || "Base created successfully");
        }
      } else {
        // Use updateBase API function
        response = await updateBase(currentBase.wafi_id, baseDataToSend);
        if (response.successWafi) {
          // Update both arrays with the updated base
          const username = usersList.find(u => u.wafi_id.toString() === currentBase.wafi_user_id.toString())?.wafi_username || 'Unknown';
          
          const updatedBase = {
            ...response.base,
            user_name: username
          };
          
          const updatedAllBases = allBases.map(b => 
            b.wafi_id === updatedBase.wafi_id ? updatedBase : b
          );
          
          setAllBases(updatedAllBases);
          
          // Re-apply filter
          const updatedBases = updatedAllBases.filter(base => {
            if (!searchTerm.trim()) return true;
            
            const lowerCaseSearch = searchTerm.toLowerCase();
            return (
              (base.wafi_tag && base.wafi_tag.toLowerCase().includes(lowerCaseSearch)) ||
              (base.wafi_name && base.wafi_name.toLowerCase().includes(lowerCaseSearch)) ||
              (base.user_name && base.user_name.toLowerCase().includes(lowerCaseSearch))
            );
          });
          
          setBases(updatedBases);
          toast.success(response.messageWafi || "Base updated successfully");
        }
      }

      if (!response.successWafi) {
        toast.error(response.messageWafi || `Error ${modalMode === 'add' ? 'creating' : 'updating'} base`);
      } else {
        setShowModal(false); // Close modal only on success
      }
    } catch (err) {
      console.error(`Error ${modalMode === 'add' ? 'creating' : 'updating'} base:`, err);
      toast.error(err.messageWafi || err.message || `Error ${modalMode === 'add' ? 'creating' : 'updating'} base`);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Bases</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Base
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search by tag, name, or user..."
                className="w-full px-4 py-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TH Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Check if bases array exists and has items */}
                  {bases && bases.length > 0 ? bases.map((base) => (
                    <tr key={base.wafi_id}>
                      <td className="px-6 py-4 whitespace-nowrap">{base.wafi_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{base.wafi_tag}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{base.wafi_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{base.wafi_th_level}</td>
                      {/* Use user_name from the API response */}
                      <td className="px-6 py-4 whitespace-nowrap">{base.user_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(base.wafi_created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {/* Attach onClick handler for edit */}
                        <button
                          onClick={() => openEditModal(base)}
                          className="text-blue-600 hover:text-blue-900 mx-1"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 mx-1"
                          onClick={() => confirmDelete(base)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    // Display message if no bases found
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No bases found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {
        showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">
                {modalMode === "add" ? "Add New Base" : "Edit Base"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">User</label>
                  <select
                    className="w-full px-3 py-2 border rounded shadow-sm"
                    value={currentBase.wafi_user_id}
                    onChange={(e) => setCurrentBase({ ...currentBase, wafi_user_id: e.target.value })}
                    required
                  >
                    <option value="">Select User</option>
                    {usersList.map(user => (
                      <option key={user.wafi_id} value={user.wafi_id}>
                        {user.wafi_username} ({user.wafi_email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Base Tag</label>
                  <input
                    type="text"
                    placeholder="#ABCDEFGH"
                    className="w-full px-3 py-2 border rounded shadow-sm"
                    value={currentBase.wafi_tag}
                    onChange={(e) => setCurrentBase({ ...currentBase, wafi_tag: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Base Name (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded shadow-sm"
                    value={currentBase.wafi_name}
                    onChange={(e) => setCurrentBase({ ...currentBase, wafi_name: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Town Hall Level</label>
                  <input
                    type="number"
                    min="1"
                    max="16" // Adjust max TH level as needed
                    className="w-full px-3 py-2 border rounded shadow-sm"
                    value={currentBase.wafi_th_level}
                    onChange={(e) => setCurrentBase({ ...currentBase, wafi_th_level: e.target.value })}
                    required
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {modalMode === "add" ? "Add Base" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
              <p>Are you sure you want to delete the base "{baseToDelete?.wafi_name}" with tag {baseToDelete?.wafi_tag}?</p>
              <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default Bases;
