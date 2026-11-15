export function validateProposals(value) {
  if (!value || !Array.isArray(value.actions) || value.actions.length > 20) throw new Error('Invalid AI proposal.');
  for (const item of value.actions) {
    if (!item || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 500 ||
      !['Inbox', 'Schedule now', 'Important', 'Someday'].includes(item.state) ||
      typeof item.start !== 'string' || (item.start !== '' && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(item.start)) ||
      typeof item.fixedTime !== 'boolean' || !Number.isInteger(item.duration) || item.duration < 1 || item.duration > 1440 ||
      !['High', 'Medium', 'Low'].includes(item.energy) || !['High', 'Medium', 'Normal'].includes(item.priority) ||
      typeof item.explanation !== 'string' || item.explanation.length > 2000 ||
      typeof item.clarification !== 'string' || item.clarification.length > 1000) throw new Error('Invalid AI proposal.');
  }
  return value.actions;
}
