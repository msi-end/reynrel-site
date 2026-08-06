export const buildWhatsAppReminderUrl = (mobile, message) => {
  const digits = (mobile || '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

export const subscriptionReminderMessage = (client, subscription) =>
  `Hi ${client.name}, this is a reminder from Reynrel Infotech that your "${subscription.itemName}" plan is valid until ${subscription.planEndDate}. Please get in touch to renew and continue uninterrupted service.`;

export const generalReminderMessage = (client) =>
  `Hi ${client.name}, this is a reminder from Reynrel Infotech. Please get in touch with us regarding your account.`;
