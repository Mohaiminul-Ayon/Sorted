export function offlineStatusLabel(online: boolean): string {
  return online ? 'On your device' : 'No connection — your plan stays here.';
}

export function aiRequiresNetworkMessage(): string {
  return 'Planning with AI needs a connection. Capture into Inbox still works on this device.';
}
