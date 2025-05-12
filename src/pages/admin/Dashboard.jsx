import React, { useState, useEffect } from "react";
import { getDashboardStats } from "@/api/dbAdminAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChessBoard, faLayerGroup, faList } from "@fortawesome/free-solid-svg-icons";

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-gray-100 mr-4">
        <FontAwesomeIcon icon={icon} className={`text-xl ${color.replace('border-', 'text-')}`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    bases: 0,
    categories: 0,
    types: 0,
    objects: 0,
    recentBases: [],
    topUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err.messageWafi || "Failed to load dashboard data");
        setLoading(false);
        console.error("Dashboard fetch error:", err);
        
        // For development - mock data
        setStats({
          users: 25,
          bases: 48,
          categories: 15,
          types: 172,
          objects: 2998,
          recentBases: [
            { wafi_id: 1, wafi_tag: '#ABC123', wafi_name: 'Main Base', wafi_th_level: 12, wafi_created_at: '2023-05-20', wafi_username: 'user1' },
            { wafi_id: 2, wafi_tag: '#DEF456', wafi_name: 'War Base', wafi_th_level: 11, wafi_created_at: '2023-05-19', wafi_username: 'user2' },
            { wafi_id: 3, wafi_tag: '#GHI789', wafi_name: 'Farm Base', wafi_th_level: 10, wafi_created_at: '2023-05-18', wafi_username: 'user3' },
          ],
          topUsers: [
            { wafi_id: 1, wafi_username: 'user1', wafi_email: 'user1@example.com', baseCountWafi: 5 },
            { wafi_id: 2, wafi_username: 'user2', wafi_email: 'user2@example.com', baseCountWafi: 3 },
            { wafi_id: 3, wafi_username: 'user3', wafi_email: 'user3@example.com', baseCountWafi: 2 },
          ]
        });
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-900 rounded-full"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={faUsers} 
          color="border-blue-500" 
        />
        <StatCard 
          title="Total Bases" 
          value={stats.bases} 
          icon={faChessBoard} 
          color="border-green-500" 
        />
        <StatCard 
          title="Categories" 
          value={stats.categories} 
          icon={faLayerGroup} 
          color="border-yellow-500" 
        />
        <StatCard 
          title="Type Definitions" 
          value={stats.types} 
          icon={faList} 
          color="border-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bases Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Bases</h2>
          {stats.recentBases && stats.recentBases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Tag</th>
                    <th className="py-2 text-left">Name</th>
                    <th className="py-2 text-left">TH Level</th>
                    <th className="py-2 text-left">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBases.map((base) => (
                    <tr key={base.wafi_id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{base.wafi_tag}</td>
                      <td className="py-2">{base.wafi_name || 'Unnamed'}</td>
                      <td className="py-2">{base.wafi_th_level}</td>
                      <td className="py-2">{base.wafi_username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent bases found.</p>
          )}
        </div>
        
        {/* Top Users Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Top Users by Base Count</h2>
          {stats.topUsers && stats.topUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Username</th>
                    <th className="py-2 text-left">Email</th>
                    <th className="py-2 text-left">Bases</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topUsers.map((user) => (
                    <tr key={user.wafi_id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{user.wafi_username}</td>
                      <td className="py-2">{user.wafi_email}</td>
                      <td className="py-2">{user.baseCountWafi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No user data available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
