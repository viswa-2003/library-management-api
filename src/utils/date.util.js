const calculateDueDate = (borrowedDate, loanPeriodDays = 14) => {
  const dueDate = new Date(borrowedDate);
  dueDate.setDate(dueDate.getDate() + loanPeriodDays);
  return dueDate;
};

const calculateOverdueDays = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  
  if (now <= due) return 0;
  
  const diffTime = now - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calculateFineAmount = (dueDate, finePerDay = 0.50) => {
  const overdueDays = calculateOverdueDays(dueDate);
  return overdueDays * finePerDay;
};

const isOverdue = (dueDate) => {
  return new Date() > new Date(dueDate);
};

module.exports = {
  calculateDueDate,
  calculateOverdueDays,
  calculateFineAmount,
  isOverdue
};