export const linesToArray = (text) =>
  (text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

export const arrayToLines = (arr) => (arr || []).join('\n');

export const csvToArray = (text) =>
  (text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const arrayToCsv = (arr) => (arr || []).join(', ');

export const linesToMetrics = (text) =>
  linesToArray(text)
    .map((line) => {
      const [label, value] = line.split(':').map((s) => s?.trim());
      return label && value ? { label, value } : null;
    })
    .filter(Boolean);

export const metricsToLines = (metrics) =>
  (metrics || []).map((m) => `${m.label}:${m.value}`).join('\n');

export const linesToHighlights = (text) =>
  linesToArray(text)
    .map((line) => {
      const [title, description] = line.split('|').map((s) => s?.trim());
      return title ? { title, description: description || '' } : null;
    })
    .filter(Boolean);

export const highlightsToLines = (highlights) =>
  (highlights || []).map((h) => `${h.title}|${h.description}`).join('\n');
