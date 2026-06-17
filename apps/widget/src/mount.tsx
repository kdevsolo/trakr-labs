import { createRoot } from 'react-dom/client';
import { FeedbackWidget } from '@trakr/widget-ui';
import widgetStyles from '@trakr/widget-ui/styles.css?inline';

type MountOptions = {
  projectKey: string;
  widgetSecret: string;
  apiUrl: string;
  mode?: 'floating' | 'inline';
};

export function mountWidget(
  container: HTMLElement,
  options: MountOptions,
): () => void {
  const shadow = container.attachShadow({ mode: 'open' });
  const mountPoint = document.createElement('div');
  const style = document.createElement('style');

  style.textContent = widgetStyles;
  shadow.append(style, mountPoint);

  const root = createRoot(mountPoint);
  root.render(
    <FeedbackWidget
      projectKey={options.projectKey}
      widgetSecret={options.widgetSecret}
      apiUrl={options.apiUrl}
      mode={options.mode ?? 'floating'}
    />,
  );

  return () => {
    root.unmount();
    shadow.remove();
  };
}
