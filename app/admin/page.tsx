// app/admin/page.tsx
'use client';

import { useState } from 'react';

export default function SimpleAdminPanel() {
  const [activeTab, setActiveTab] = useState('buses');

  const buses = [
    { id: 'BUS 102', driver: 'Michael Johnson', route: 'Route A', status: 'Active', students: 45 },
    { id: 'BUS 205', driver: 'Sarah Williams', route: 'Route B', status: 'Active', students: 38 },
    { id: 'BUS 312', driver: 'David Brown', route: 'Route C', status: 'Maintenance', students: 0 },
    { id: 'BUS 418', driver: 'Emma Davis', route: 'Route D', status: 'Active', students: 42 },
  ];

  const routes = [
    { name: 'Route A', buses: 6, stops: 12 },
    { name: 'Route B', buses: 4, stops: 10 },
    { name: 'Route C', buses: 5, stops: 15 },
    { name: 'Route D', buses: 3, stops: 8 },
  ];

  

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white">
        <div className="p-6 border-b border-blue-500">
          <h1 className="text-xl font-bold">🚌 Admin Panel</h1>
        </div>
        
        <nav className="p-4">
          <button
            onClick={() => setActiveTab('buses')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
              activeTab === 'buses' ? 'bg-blue-700' : 'hover:bg-blue-700'
            }`}
          >
            🚌 Manage Buses
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
              activeTab === 'routes' ? 'bg-blue-700' : 'hover:bg-blue-700'
            }`}
          >
            📍 Manage Routes
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'buses' && 'Bus Management'}
            {activeTab === 'routes' && 'Route Management'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Buses Tab */}
          {activeTab === 'buses' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">All Buses</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  + Add Bus
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bus ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Route</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Students</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {buses.map((bus) => (
                    <tr key={bus.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{bus.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{bus.driver}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{bus.route}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          bus.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {bus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{bus.students}</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Routes Tab */}
          {activeTab === 'routes' && (
            <div>
              <div className="mb-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  + Add Route
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => (
                  <div key={route.name} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{route.name}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Buses:</span> {route.buses}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Stops:</span> {route.stops}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                        Edit
                      </button>
                      <button className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}