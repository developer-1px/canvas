import { useEffect } from 'react';

export function useBodyAttributes(attributes: Readonly<Record<string, string>>) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previousAttributes = new Map<string, string | null>();
    Object.entries(attributes).forEach(([name, value]) => {
      previousAttributes.set(name, document.body.getAttribute(name));
      document.body.setAttribute(name, value);
    });

    return () => {
      previousAttributes.forEach((value, name) => {
        if (value === null) {
          document.body.removeAttribute(name);
          return;
        }
        document.body.setAttribute(name, value);
      });
    };
  }, [attributes]);
}
