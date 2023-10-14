export default function isPremium(profile?: IProfile) {
  const subscription = profile?.subscription;
  if (subscription?.lifetime?.paymentIntentStatus === 'succeeded') return true;
  return subscription?.recurring?.subscriptionStatus === 'active';
}
