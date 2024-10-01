import { Container, Grid, ListItemButton, ListItemIcon, Stack, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StyledListItemText } from './common/StyledComponents';
import { menuColumns } from './menu-defs';
import { StyledHead } from './common/StyledHead';

const showDescription = false;

export function AppMenu() {
  const navigate = useNavigate();

  return (
    <Container>
      <Grid key={'grid-2'} container justifyContent="center" spacing={2}>
        {menuColumns.map((col, index) => (
          <Grid key={col.name} item sm={3}>
            <Stack direction="column" spacing={2}>
              <StyledHead sx={{ margin: '1em 0 2em 0' }}>{col.name}</StyledHead>{' '}
              {col.entries.map(({ hidden, path, name, description, icon }) =>
                hidden === true ? undefined : (
                  <Stack key={path} direction="column" spacing={0}>
                    <ListItemButton onClick={() => navigate('/' + path)}>
                      {icon && <ListItemIcon>{icon}</ListItemIcon>}
                      <Tooltip title={description}>
                        <StyledListItemText
                          primary={name}
                          secondary={
                            <span key={'icon'}>
                              {
                                // icon ||
                                showDescription ? description : ''
                              }
                            </span>
                          }
                        />
                      </Tooltip>
                    </ListItemButton>
                  </Stack>
                )
              )}
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
