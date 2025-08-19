function getCustomerDisplayName(customer) {
  if (!customer) return '';

  // Use organization name if available and not empty
  if (customer.organization_name && typeof customer.organization_name === 'string' && customer.organization_name.trim() !== '') {
    return customer.organization_name.trim();
  }

  // Build name from first and last name if available
  const first = customer.customer_first_name ? customer.customer_first_name.trim() : '';
  const last = customer.customer_last_name ? customer.customer_last_name.trim() : '';
  const fullName = [first, last].filter(Boolean).join(' ');

  return fullName;
}

export default getCustomerDisplayName;
