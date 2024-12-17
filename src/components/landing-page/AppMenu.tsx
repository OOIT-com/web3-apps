import { ListItemButton, ListItemIcon, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StyledListItemText } from '../common/StyledComponents';
import { appMenuColumns } from './app-menu-columns';
import Grid from '@mui/material/Grid2';
import { DivBox } from '../common/DivBox';
import { MenuTooltip } from '../common/StyledTooltips';
import { Fragment, useCallback } from 'react';
import { useAppContext } from '../AppContextProvider';
import { Web3SessionMode } from '../../types';

const showDescription = false;

export function AppMenu() {
  const navigate = useNavigate();

  const { web3Session } = useAppContext();

  const checkMode = useCallback(
    (webSessionModes?: Web3SessionMode[]): boolean =>
      webSessionModes && web3Session ? webSessionModes.includes(web3Session.mode) : true,
    [web3Session]
  );

  return (
    <Stack sx={{ width: '100%' }}>
      <Grid key={'grid-2'} container justifyContent="left" spacing={1}>
        {appMenuColumns.map((menuColumn) => (
          <Fragment key={menuColumn.name}>
            <Grid key={'title' + menuColumn.name} size={12}>
              <DivBox sx={{ margin: '1em 0 0.4em 0', display: 'inline-block', fontSize: '1.4em' }}>
                {menuColumn.name}
              </DivBox>
            </Grid>
            {menuColumn.appMenuEntries.map(({ path, name, description, icon, webSessionModes }) =>
              checkMode(webSessionModes) ? (
                <Grid key={path} size={3}>
                  <MenuTooltip title={description}>
                    <ListItemButton onClick={() => navigate('/' + path)}>
                      {icon && <ListItemIcon>{icon}</ListItemIcon>}

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
                    </ListItemButton>
                  </MenuTooltip>
                </Grid>
              ) : (
                ''
              )
            )}
          </Fragment>
        ))}
      </Grid>
    </Stack>
  );
}
