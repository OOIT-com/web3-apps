import ReactMarkdown from 'react-markdown';
import { LDBox } from '../common/StyledBoxes';

import { Container } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import rehypeRaw from 'rehype-raw';

export const MDElement: FC<{ mdFile: string }> = ({ mdFile }) => {
  const [mdText, setMdText] = useState('');

  useEffect(() => {
    fetch(mdFile)
      .then((res) => res.text())
      .then((text) => setMdText(text))
      .catch(console.error);
  }, [mdFile]);

  return (
    <Container>
      <LDBox>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            img: ({ node, ...props }) => <img src={'./images/' + props.src} alt={props.alt} />,
            a: ({ node, ...props }) => (
              <a href={props.href} target="_blank" rel="noopener noreferrer">
                {props.children}
              </a>
            )
          }}
        >
          {mdText}
        </ReactMarkdown>
      </LDBox>
    </Container>
  );
};
