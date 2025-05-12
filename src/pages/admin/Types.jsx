import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
import { getTypes, createType, updateType, deleteType, getCategories } from "@/api/dbAdminAPI";
import { toast } from "react-toastify";

const Types = () => {
  const [allTypes, setAllTypes] = useState([]);  // Store all types
  const [types, setTypes] = useState([]);  // Store filtered types
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add or edit
  const [currentType, setCurrentType] = useState({ 
    wafi_name: "", 
    wafi_category_id: "" 
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchTypes();
  }, []);

  // Apply client-side filtering when searchTerm or filterCategory changes
  useEffect(() => {
    if (allTypes.length > 0) {
      filterTypesList();
    }
  }, [searchTerm, filterCategory, allTypes]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error(err.messageWafi || err.message || "Failed to load categories");
      setCategories([]);
    }
  };

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const data = await getTypes();
      const typesData = Array.isArray(data) ? data : [];
      setAllTypes(typesData);
      setTypes(typesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching types:", err);
      setError(err.messageWafi || err.message || "Failed to load types data");
      setLoading(false);
      setAllTypes([]);
      setTypes([]);
    }
  };

  const filterTypesList = () => {
    let filtered = [...allTypes];
    
    // Filter by search term
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(type => 
        type.wafi_name.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(type => 
        type.wafi_category_id.toString() === filterCategory.toString()
      );
    }
    
    setTypes(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterTypesList(); // This is redundant since the useEffect will handle this
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentType({ 
      wafi_name: "", 
      wafi_category_id: categories.length > 0 ? categories[0].wafi_id : "" 
    });
    setShowModal(true);
  };

  const openEditModal = (type) => {
    setModalMode("edit");
    setCurrentType({ 
      wafi_id: type.wafi_id,
      wafi_name: type.wafi_name,
      wafi_category_id: type.wafi_category_id
    });
    setShowModal(true);
  };

  const confirmDelete = (type) => {
    setTypeToDelete(type);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteType(typeToDelete.wafi_id);
      if (response.successWafi) {
        // Update both arrays
        const updatedTypes = allTypes.filter(t => t.wafi_id !== typeToDelete.wafi_id);
        setAllTypes(updatedTypes);
        setTypes(updatedTypes.filter(type => {
          let match = true;
          if (searchTerm.trim()) {
            match = match && type.wafi_name.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (filterCategory) {
            match = match && type.wafi_category_id.toString() === filterCategory.toString();
          }
          return match;
        }));
        setShowDeleteModal(false);
        toast.success(response.messageWafi || "Type deleted successfully");
      } else {
        toast.error(response.messageWafi || "Error deleting type");
      }
    } catch (err) {
      console.error("Error deleting type:", err);
      toast.error(err.messageWafi || err.message || "Error deleting type");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (modalMode === "add") {
        response = await createType(currentType);
        if (response.successWafi) {
          fetchTypes(); // Re-fetch all types
          toast.success(response.messageWafi || "Type created successfully");
        }
      } else {
        response = await updateType(currentType.wafi_id, currentType);
        if (response.successWafi) {
          // Find category name for display
          const categoryName = categories.find(c => c.wafi_id === parseInt(currentType.wafi_category_id))?.wafi_name;
          
          // Update allTypes
          const updatedAllTypes = allTypes.map(t => {
            if (t.wafi_id === currentType.wafi_id) {
              return { 
                ...t, 
                ...currentType, 
                category_name: categoryName
              };
            }
            return t;
          });
          
          setAllTypes(updatedAllTypes);
          
          // Re-apply filters to update displayed types
          const updatedTypes = updatedAllTypes.filter(type => {
            let match = true;
            if (searchTerm.trim()) {
              match = match && type.wafi_name.toLowerCase().includes(searchTerm.toLowerCase());
            }
            if (filterCategory) {
              match = match && type.wafi_category_id.toString() === filterCategory.toString();
            }
            return match;
          });
          
          setTypes(updatedTypes);
          toast.success(response.messageWafi || "Type updated successfully");
        }
      }
      if (!response.successWafi) {
        toast.error(response.messageWafi || `Error ${modalMode === 'add' ? 'creating' : 'updating'} type`);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      console.error(`Error ${modalMode === 'add' ? 'creating' : 'updating'} type:`, err);
      toast.error(err.messageWafi || err.message || `Error ${modalMode === 'add' ? 'creating' : 'updating'} type`);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Types</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Type
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-grow">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search by name..."
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
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            <select
              className="px-4 py-2 border rounded"
              value={filterCategory}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.wafi_id} value={category.wafi_id}>
                  {category.wafi_name}
                </option>
              ))}
            </select>
          </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {types && types.length > 0 ? types.map((type) => (
                    <tr key={type.wafi_id}>
                      <td className="px-6 py-4 whitespace-nowrap">{type.wafi_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{type.wafi_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                          {type.category_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(type.wafi_updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mx-1"
                          onClick={() => openEditModal(type)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 mx-1"
                          onClick={() => confirmDelete(type)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No types found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {modalMode === "add" ? "Add New Type" : "Edit Type"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Type Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={currentType.wafi_name}
                  onChange={(e) => setCurrentType({...currentType, wafi_name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={currentType.wafi_category_id}
                  onChange={(e) => setCurrentType({...currentType, wafi_category_id: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.wafi_id} value={category.wafi_id}>
                      {category.wafi_name}
                    </option>
                  ))}
                </select>
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
                  {modalMode === "add" ? "Add Type" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete the type "{typeToDelete?.wafi_name}"?</p>
            <p className="text-red-600 text-sm mt-2">This will also delete all objects of this type in all bases.</p>
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
      )}
    </>
  );
};

export default Types;
