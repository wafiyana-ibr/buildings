import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch, faPlus, faUserShield, faUser } from "@fortawesome/free-solid-svg-icons";
import { getUsers, createUser, updateUser, deleteUser } from "@/api/dbAdminAPI";
import { toast } from "react-toastify";

const Users = () => {
  const [allUsers, setAllUsers] = useState([]);  // Store all users
  const [users, setUsers] = useState([]); // Store filtered users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    wafi_username: '',
    wafi_email: '',
    wafi_password: '',
    wafi_role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []); // Remove searchTerm dependency since we'll filter client-side

  // Apply client-side filtering when searchTerm changes
  useEffect(() => {
    if (allUsers.length > 0) {
      filterUsers();
    }
  }, [searchTerm, allUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(); // Remove searchTerm parameter
      setAllUsers(data || []);
      setUsers(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.messageWafi || err.message || "Failed to load users data");
      setLoading(false);
      
      // Fallback to empty array if API fails
      setAllUsers([]);
      setUsers([]);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setUsers(allUsers);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = allUsers.filter(user => 
      user.wafi_username.toLowerCase().includes(lowerCaseSearch) || 
      user.wafi_email.toLowerCase().includes(lowerCaseSearch)
    );
    setUsers(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterUsers(); // This is actually redundant since the useEffect will handle this
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteUser(userToDelete.wafi_id);
      // Update both arrays
      const updatedUsers = allUsers.filter(user => user.wafi_id !== userToDelete.wafi_id);
      setAllUsers(updatedUsers);
      setUsers(updatedUsers.filter(user => 
        searchTerm ? (
          user.wafi_username.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.wafi_email.toLowerCase().includes(searchTerm.toLowerCase())
        ) : true
      ));
      setShowDeleteModal(false);
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.messageWafi || "Error deleting user");
    }
  };

  const handleEdit = (user) => {
    setEditUser({...user});
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { wafi_password, ...userDataToUpdate } = editUser;
    const payload = wafi_password ? editUser : userDataToUpdate;

    try {
      const response = await updateUser(editUser.wafi_id, payload);
      if (response.successWafi) {
        // Update both arrays
        const updatedAllUsers = allUsers.map(user => 
          user.wafi_id === editUser.wafi_id ? {...user, ...payload} : user
        );
        setAllUsers(updatedAllUsers);
        setUsers(updatedAllUsers.filter(user => 
          searchTerm ? (
            user.wafi_username.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.wafi_email.toLowerCase().includes(searchTerm.toLowerCase())
          ) : true
        ));
        setShowEditModal(false);
        toast.success("User updated successfully");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.messageWafi || "Error updating user");
    }
  };

  const handleAddUser = () => {
    setNewUser({ wafi_username: '', wafi_email: '', wafi_password: '', wafi_role: 'user' });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createUser(newUser);
      if (response.successWafi) {
        fetchUsers(); // Re-fetch all users after adding a new one
        setShowAddModal(false);
        toast.success("User created successfully");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error(err.messageWafi || "Error creating user");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button 
          onClick={handleAddUser} 
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search by username or email..."
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users && users.length > 0 ? users.map((user) => (
                    <tr key={user.wafi_id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.wafi_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.wafi_username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.wafi_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.wafi_role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          <FontAwesomeIcon icon={user.wafi_role === 'admin' ? faUserShield : faUser} className="mr-1" />
                          {user.wafi_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.wafi_created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mx-1"
                          onClick={() => handleEdit(user)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 mx-1"
                          onClick={() => confirmDelete(user)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete the user "{userToDelete?.wafi_username}"?</p>
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
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={editUser?.wafi_username || ''}
                  onChange={(e) => setEditUser({...editUser, wafi_username: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={editUser?.wafi_email || ''}
                  onChange={(e) => setEditUser({...editUser, wafi_email: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  onChange={(e) => setEditUser({...editUser, wafi_password: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                <select
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={editUser?.wafi_role || 'user'}
                  onChange={(e) => setEditUser({...editUser, wafi_role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={newUser.wafi_username}
                  onChange={(e) => setNewUser({...newUser, wafi_username: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={newUser.wafi_email}
                  onChange={(e) => setNewUser({...newUser, wafi_email: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={newUser.wafi_password}
                  onChange={(e) => setNewUser({...newUser, wafi_password: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                <select
                  className="w-full px-3 py-2 border rounded shadow-sm"
                  value={newUser.wafi_role}
                  onChange={(e) => setNewUser({...newUser, wafi_role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
