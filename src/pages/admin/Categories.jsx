import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/api/dbAdminAPI";
import { toast } from "react-toastify";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add or edit
  const [currentCategory, setCurrentCategory] = useState({ wafi_name: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to load categories data");
      setLoading(false);
      
      // Mock data for development if needed
      setCategories([
        { wafi_id: 1, wafi_name: "Defense", wafi_updated_at: "2023-05-10" },
        { wafi_id: 2, wafi_name: "Resource", wafi_updated_at: "2023-05-12" },
        { wafi_id: 3, wafi_name: "Army", wafi_updated_at: "2023-05-15" },
        { wafi_id: 4, wafi_name: "Trap", wafi_updated_at: "2023-05-20" },
      ]);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentCategory({ wafi_name: "" });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setCurrentCategory({ ...category });
    setShowModal(true);
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryToDelete.wafi_id);
      setCategories(categories.filter(c => c.wafi_id !== categoryToDelete.wafi_id));
      setShowDeleteModal(false);
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error(err.message || "Error deleting category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        const response = await createCategory(currentCategory);
        if (response.successWafi) {
          setCategories([...categories, response.category]);
          toast.success("Category created successfully");
        }
      } else {
        const response = await updateCategory(currentCategory.wafi_id, currentCategory);
        if (response.successWafi) {
          setCategories(categories.map(c => 
            c.wafi_id === currentCategory.wafi_id ? response.category : c
          ));
          toast.success("Category updated successfully");
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving category:", err);
      toast.error(err.message || "Error saving category");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.wafi_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{category.wafi_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{category.wafi_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(category.wafi_updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mx-1"
                        onClick={() => openEditModal(category)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 mx-1"
                        onClick={() => confirmDelete(category)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {modalMode === "add" ? "Add New Category" : "Edit Category"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Category Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={currentCategory.wafi_name}
                  onChange={(e) => setCurrentCategory({...currentCategory, wafi_name: e.target.value})}
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
                  {modalMode === "add" ? "Add Category" : "Save Changes"}
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
            <p>Are you sure you want to delete the category "{categoryToDelete?.wafi_name}"?</p>
            <p className="text-red-600 text-sm mt-2">This will also delete all types associated with this category.</p>
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

export default Categories;
