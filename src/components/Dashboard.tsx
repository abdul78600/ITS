import React from 'react';
import { 
  Laptop, AlertCircle, CheckCircle2, Users, TrendingUp, Clock, MessageSquare, 
  PhoneCall, BarChart, ArrowRight, Timer, UserCheck, Award, ThumbsUp
} from 'lucide-react';

export function Dashboard() {
  const stats = [
    { 
      icon: Laptop,
      label: 'Total Assets',
      value: '234',
      change: '+12%',
      color: 'bg-blue-500'
    },
    {
      icon: AlertCircle,
      label: 'Open Tickets',
      value: '18',
      change: '-5%',
      color: 'bg-red-500'
    },
    {
      icon: CheckCircle2,
      label: 'Resolved Today',
      value: '24',
      change: '+18%',
      color: 'bg-green-500'
    },
    {
      icon: Users,
      label: 'Active Users',
      value: '156',
      change: '+3%',
      color: 'bg-purple-500'
    }
  ];

  const serviceMetrics = [
    {
      icon: Clock,
      label: 'Average Response Time',
      value: '15 mins',
      trend: 'down',
      color: 'text-green-500'
    },
    {
      icon: ThumbsUp,
      label: 'Customer Satisfaction',
      value: '94%',
      trend: 'up',
      color: 'text-blue-500'
    },
    {
      icon: Award,
      label: 'SLA Compliance',
      value: '98.5%',
      trend: 'up',
      color: 'text-purple-500'
    }
  ];

  const quickActions = [
    {
      icon: MessageSquare,
      label: 'Create Ticket',
      color: 'bg-blue-500'
    },
    {
      icon: PhoneCall,
      label: 'Request Support',
      color: 'bg-green-500'
    },
    {
      icon: UserCheck,
      label: 'Access Request',
      color: 'bg-purple-500'
    }
  ];

  const recentRequests = [
    {
      id: 1,
      type: 'Software Installation',
      priority: 'High',
      requester: 'John Doe',
      status: 'Pending',
      time: '10 mins ago'
    },
    {
      id: 2,
      type: 'Network Access',
      priority: 'Medium',
      requester: 'Jane Smith',
      status: 'In Progress',
      time: '25 mins ago'
    },
    {
      id: 3,
      type: 'Hardware Support',
      priority: 'Critical',
      requester: 'Mike Johnson',
      status: 'Assigned',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Service Module Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Service Management</h2>
            <button className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {serviceMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                    <h3 className="font-medium text-gray-700">{metric.label}</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`h-4 w-4 ${metric.color}`} />
                    <span className={`text-sm ${metric.color}`}>
                      {metric.trend === 'up' ? 'Improving' : 'Decreasing'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Service Requests */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Service Requests</h3>
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{request.type}</h4>
                      <p className="text-sm text-gray-600">Requested by {request.requester}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        request.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        request.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.priority}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {request.status}
                      </span>
                      <span className="text-sm text-gray-500">{request.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Tickets</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Printer not working</p>
                    <p className="text-sm text-gray-600">Marketing Department</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    In Progress
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Service Performance</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <BarChart className="h-8 w-8 text-gray-400" />
              <p className="text-gray-500 ml-2">Service performance metrics will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}