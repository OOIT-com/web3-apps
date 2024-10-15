import DOMPurify from 'dompurify';
import { FC } from 'react';

export const Html: FC<{ content: string }> = ({ content }) => {
  const cleanHtmlString = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtmlString }} />;
};
