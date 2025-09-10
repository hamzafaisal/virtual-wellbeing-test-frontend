export const ERROR_MESSAGES = {
	NETWORK_GENERIC: 'Network error. Please try again.',
	UNKNOWN: 'Something went wrong. Please try again later.',
	VALIDATION_FAILED: 'Please check the form and try again.',
	CLIENT_REQUIRED: 'Please select a client.',
	DATETIME_REQUIRED: 'Please choose a valid date and time.'
} as const;

export const SUCCESS_MESSAGES = {
	APPOINTMENT_CREATED: 'Appointment scheduled successfully.',
	APPOINTMENT_UPDATED: 'Appointment updated successfully.',
	APPOINTMENT_CANCELLED: 'Appointment cancelled successfully.',
	SYNC_TRIGGERED: 'Sync has been triggered successfully.'
} as const;

