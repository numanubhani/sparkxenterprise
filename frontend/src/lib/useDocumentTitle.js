import { useEffect } from 'react';

export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | SPARK X Technology` : 'SPARK X Technology | Enterprise AI Infrastructure Delivered Worldwide';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
