import ReactMarkdown from 'react-markdown';
import { LDBox } from './StyledBoxes';

import { Container, IconButton } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import rehypeRaw from 'rehype-raw';
import { NotifyFun } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

export const MDElement: FC<{ mdFile: string; close?: NotifyFun }> = ({ mdFile, close }) => {
  const [mdText, setMdText] = useState('');

  useEffect(() => {
    fetch(mdFile)
      .then((res) => res.text())
      .then((text) => setMdText(text))
      .catch(console.error);
  }, [mdFile]);

  return (
    <Container
      sx={{
        background: 'white',
        margin: '1em',
        borderRadius: '1em',
        position: 'relative'
      }}
    >
      {close && (
        <IconButton
          sx={{ position: 'absolute', top: '1em', right: '1em' }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            close();
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
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
