export const toIsoUtc = (date: Date): string => {
	return date.toISOString();
};

export const formatLocalDateTime = (iso: string): string => {
	if (!iso) return '-';
	const d = new Date(iso);
	if (isNaN(d.getTime())) return '-';
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(d);
};


