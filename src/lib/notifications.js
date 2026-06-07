import { api } from './api';

export async function ensurePushSubscription() {
  return syncPushSubscription({ requestPermission: true });
}

export async function syncPushSubscription({ requestPermission = false } = {}) {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  if (Notification.permission !== 'granted' && !requestPermission) {
    return false;
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();

  if (permission !== 'granted') {
    return false;
  }

  const registration = await waitForServiceWorkerRegistration();
  if (!registration) {
    return false;
  }

  const { publicKey } = await api.getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription = await getValidSubscription(
    registration,
    existingSubscription,
    applicationServerKey,
  );

  await api.savePushSubscription({
    ...subscription.toJSON(),
    client_origin: window.location.origin,
  });
  return true;
}

async function waitForServiceWorkerRegistration() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(null), 2500);
    }),
  ]);
}

async function getValidSubscription(registration, existingSubscription, applicationServerKey) {
  if (existingSubscription && isSameApplicationServerKey(existingSubscription, applicationServerKey)) {
    return existingSubscription;
  }

  if (existingSubscription) {
    await existingSubscription.unsubscribe();
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
}

function isSameApplicationServerKey(subscription, applicationServerKey) {
  const existingKey = subscription.options?.applicationServerKey;
  if (!existingKey) {
    return true;
  }

  const existingBytes = new Uint8Array(existingKey);
  if (existingBytes.length !== applicationServerKey.length) {
    return false;
  }

  return existingBytes.every((value, index) => value === applicationServerKey[index]);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
