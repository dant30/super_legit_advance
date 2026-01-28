export const formatCurrency = (value: number, currency = 'KES'): string => {
  return `${currency} ${value.toLocaleString()}`
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString()
}

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
}