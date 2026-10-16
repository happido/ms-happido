import api from './api';

let mapplsLoadPromise: Promise<boolean> | null = null;

/**
 * Loads the Mappls Web SDK dynamically into the browser context.
 * Standardizes mapping across the entire Happido platform using Mappls (MapmyIndia).
 */
export async function loadMapplsSDK(libraries: string[] = ['direction']): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  // @ts-ignore
  if (window.mappls && window.mappls.Map) return true;

  if (mapplsLoadPromise) return mapplsLoadPromise;

  mapplsLoadPromise = new Promise(async (resolve) => {
    try {
      const res = await api.post('/mappls/token', {});
      const token = res.data?.access_token;
      if (!token) {
        console.warn('Mappls token not received from server');
        resolve(false);
        return;
      }

      if (!document.getElementById('mappls-script')) {
        const script = document.createElement('script');
        script.id = 'mappls-script';
        script.src = `https://apis.mappls.com/advancedmaps/api/${token}/map_sdk?layer=vector&v=3.0`;
        script.async = true;

        script.onload = () => {
          if (libraries.length > 0) {
            const pluginScript = document.createElement('script');
            pluginScript.id = 'mappls-plugin-script';
            pluginScript.src = `https://apis.mappls.com/advancedmaps/api/${token}/map_sdk_plugins?v=3.0&libraries=${libraries.join(',')}`;
            pluginScript.async = true;
            pluginScript.onload = () => resolve(true);
            pluginScript.onerror = () => resolve(true); // Base map is ready even if plugin fails
            document.head.appendChild(pluginScript);
          } else {
            resolve(true);
          }
        };

        script.onerror = () => {
          console.error('Failed to load Mappls SDK script');
          resolve(false);
        };

        document.head.appendChild(script);
      } else {
        const check = setInterval(() => {
          // @ts-ignore
          if (window.mappls && window.mappls.Map) {
            clearInterval(check);
            resolve(true);
          }
        }, 200);
      }
    } catch (err) {
      console.error('Error loading Mappls SDK:', err);
      resolve(false);
    }
  });

  return mapplsLoadPromise;
}
