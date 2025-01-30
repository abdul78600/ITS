// Update the unit price input field
<div className="relative">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₨</span>
  <input
    type="number"
    min="0"
    step="0.01"
    value={item.unitPrice}
    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="0.00"
    required
  />
</div>