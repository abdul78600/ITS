// Update the formatNumber function
const formatNumber = (value: number, unit: string) => {
  if (unit === '%') return `${value}%`;
  if (unit === 'GB') return `${value} GB`;
  if (unit === 'PKR') return `₨${value.toLocaleString()}`;
  return value.toLocaleString();
};

// Update the Cost Overview metrics
{renderMetricsCard('Total Expenses', 45250, 'PKR', DollarSign, 8)}
{renderMetricsCard('Infrastructure', 28500, 'PKR', Server, 5)}
{renderMetricsCard('Software', 12750, 'PKR', Laptop, 12)}
{renderMetricsCard('Services', 4000, 'PKR', Cloud, -3)}

// Update the cost breakdown section
<div className="text-right">
  <p className="font-medium text-gray-900">₨{item.cost.toLocaleString()}</p>
  <p className="text-sm text-gray-500">Budget: ₨{item.budget.toLocaleString()}</p>
</div>