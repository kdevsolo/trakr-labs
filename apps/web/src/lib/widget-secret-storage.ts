const storageKey = (projectId: string) => `trakr-widget-secret:${projectId}`;

export function readWidgetSecret(projectId: string): string | null {
  if (typeof window === "undefined" || !projectId) {
    return null;
  }

  return sessionStorage.getItem(storageKey(projectId));
}

export function storeWidgetSecret(projectId: string, secret: string) {
  if (typeof window === "undefined" || !projectId) {
    return;
  }

  sessionStorage.setItem(storageKey(projectId), secret);
}

export function clearWidgetSecret(projectId: string) {
  if (typeof window === "undefined" || !projectId) {
    return;
  }

  sessionStorage.removeItem(storageKey(projectId));
}
