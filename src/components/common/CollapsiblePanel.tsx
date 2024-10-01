import { LDBox } from './StyledBoxes';
import * as React from 'react';
import { FC, ReactNode, useState } from 'react';
import { Accordion, AccordionSummary, IconButton, Stack } from '@mui/material';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { HelpBox } from './HelpBox';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type Level = 'top' | 'second' | 'third' | 'fourth' | 'fifth';
type Styles = 'title' | 'outer';
const styles: Record<Level, Record<Styles, any>> = {
  top: {
    title: {
      fontSize: '1.6em',
      //margin: '1em 0 0.4em 0'
      lineHeight: '1.6'
    },
    outer: {}
  },
  second: {
    title: { fontSize: '1.3em', margin: '0.3em 0 0.4em 0' },
    outer: { border: 'solid 2px gray', borderRadius: '' }
  },
  third: {
    title: { fontSize: '1.1em', margin: '0.3em 0 0.4em 0' },
    outer: { border: 'solid 1px gray', borderRadius: '' }
  },
  fourth: {
    title: { fontSize: '1.1em', margin: '0.3em 0 0.4em 0' },
    outer: { border: 'solid 1px gray', borderRadius: '' }
  },
  fifth: {
    title: { fontSize: '1.1em', margin: '0.3em 0 0.4em 0' },
    outer: { border: 'solid 1px gray', borderRadius: '' }
  }
};
export type CollapsiblePanelProps = {
  title: string | ReactNode;
  help?: string | ReactNode;
  toolbar?: ReactNode | ReactNode[];
  content: ReactNode | ReactNode[];
  level?: Level;
  collapsible?: boolean;
  collapsed?: boolean;
};
export const CollapsiblePanel: FC<CollapsiblePanelProps> = ({
  title,
  help,
  toolbar,
  content,
  level = 'second',
  collapsible = true,
  collapsed = false
}) => {
  const [exp, setExp] = useState(!collapsed);

  const expandIcon = collapsible ? <ExpandMoreIcon /> : undefined;

  const [helpOn, setHelpOn] = useState(false);
  let titleElement = typeof title === 'string' ? <Stack sx={{ whiteSpace: 'nowrap' }}>{title}</Stack> : title;
  if (help) {
    titleElement = (
      <Stack direction={'row'} justifyContent="left" alignItems="baseline" spacing={1} sx={{ whiteSpace: 'nowrap' }}>
        {title}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setHelpOn((b) => !b);
          }}
        >
          <InfoOutlinedIcon />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Accordion expanded={!collapsible || exp} onChange={() => setExp((b) => !b)}>
      <AccordionSummary
        expandIcon={expandIcon}
        aria-controls="panel1bh-content"
        id="panel1bh-header"
        sx={{ backgroundColor: '#f2f2f2' }}
      >
        <Stack sx={{ width: '100%' }}>
          <Stack key={'title-row'} direction={'row'} justifyContent="space-between" alignItems="center" spacing={4}>
            <LDBox sx={styles[level].title} direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
              {titleElement}
            </LDBox>
            {exp && (
              <Stack
                key={'title-row'}
                direction={'row'}
                sx={{ paddingRight: '1em' }}
                justifyContent="space-between"
                alignItems="baseline"
                spacing={2}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {toolbar}
              </Stack>
            )}
          </Stack>
          {helpOn && <HelpBox help={help} done={() => setHelpOn(false)} />}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>{content}</Stack>
      </AccordionDetails>
    </Accordion>
  );
};
