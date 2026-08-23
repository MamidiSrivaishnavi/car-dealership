function validateVehicle({ make, model, category, price, quantity }) {
  if (!make) return 'Make is required';
  if (!model) return 'Model is required';
  if (!category) return 'Category is required';
  if (price === undefined || price === null) return 'Price is required';
  if (typeof price !== 'number' || price < 0) return 'Price must be a non-negative number';
  if (quantity === undefined || quantity === null) return 'Quantity is required';
  if (typeof quantity !== 'number' || quantity < 0) return 'Quantity must be a non-negative number';
  return null;
}

module.exports = { validateVehicle };
