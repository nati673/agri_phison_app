import { Fragment, useMemo, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// project-imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { MenuFromAPI } from 'menu-items/dashboard';

import useConfig from 'hooks/useConfig';
import { MenuOrientation, HORIZONTAL_MAX_ITEM } from 'config';
import { useGetMenu, useGetMenuMaster } from 'api/menu';
import { useGetUserPermissions } from 'api/users';

// Permission filter (stable, safe)
function filterByPermission(items, userPermissions) {
  // Robustness: always array
  function hasPermission(requiredPerms, userPerms) {
    if (!requiredPerms || requiredPerms.length === 0) return true;
    if (requiredPerms === 'all') return true;
    const required = Array.isArray(requiredPerms) ? requiredPerms : [];
    const user = Array.isArray(userPerms) ? userPerms : [];
    if (user.length === 0) return false;
    return required.some((req) => user.some((up) => req.action === up.action && req.module === up.module_name));
  }
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => !item.permissions || hasPermission(item.permissions, userPermissions))
    .map((item) => ({
      ...item,
      children: item.children ? filterByPermission(item.children, userPermissions) : undefined
    }));
}

export default function Navigation() {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { perm } = useGetUserPermissions();
  const { menuOrientation } = useConfig();
  const { menuLoading } = useGetMenu();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const userPerm = perm && perm.permissions;

  const [selectedID, setSelectedID] = useState('');
  const [selectedItems, setSelectedItems] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0);

  const filteredMenuItems = useMemo(() => {
    let items = Array.isArray(menuItem.items) ? menuItem.items : [];
    items = filterByPermission(items, userPerm || []);
    return items;
  }, [userPerm]);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;
  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = filteredMenuItems.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < filteredMenuItems.length) {
    lastItemId = filteredMenuItems[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = filteredMenuItems.slice(lastItem - 1).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && { url: item.url })
    }));
  }

  const navGroups = filteredMenuItems.slice(0, lastItemIndex + 1).map((item) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <Fragment key={item.id}>
              {menuOrientation !== MenuOrientation.HORIZONTAL && <Divider sx={{ my: 0.5 }} />}
              <NavItem item={item} level={1} isParents />
            </Fragment>
          );
        }
        return (
          <NavGroup
            key={item.id}
            selectedID={selectedID}
            setSelectedID={setSelectedID}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 2) : 0,
        '& > ul:first-of-type': { mt: 0 },
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block'
      }}
    >
      {navGroups}
    </Box>
  );
}
