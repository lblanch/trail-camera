/* eslint-disable no-dupe-keys */
import React from 'react'
import { Skeleton, Box, Flex, Menu, MenuButton, Avatar, Heading,
  MenuList, MenuItem, Button, useColorModeValue, Text, Spacer,
  MenuDivider } from '@chakra-ui/react'

const UserMenu = ({ user, logout }) => {

  const logoutHandler = async () => {
    await logout()
  }

  return (
    <Flex alignItems={'center'} justifyContent={'space-between'}>
      <Menu>
        <MenuButton
          name="user-avatar"
          as={Button}
          rounded={'full'}
          variant={'link'}
          cursor={'pointer'}
          minW={0}>
          <Avatar
            name={user.name}
            size={'sm'}
            src={''}
          />
        </MenuButton>
        <MenuList name="user-menu">
          { user.role === 'admin' ? <MenuItem>Settings</MenuItem> : <></> }
          <MenuItem>Profile</MenuItem>
          <MenuDivider/>
          <MenuItem name="user-logout" onClick={logoutHandler}>Logout</MenuItem>
        </MenuList>
      </Menu>
      <Box p={3}>
        <Text>{ user.name }</Text>
      </Box>
    </Flex>
  )
}

const Header = ({ loading, user, logout }) => {

  const skeletonReturn = <Skeleton height="20px" />
  const headerReturn =
    <Box sx={{ position: '-webkit-sticky', position: 'sticky', top: 0, 'z-index': 1 }} name="app-header" bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Heading>{'TrailCam'}</Heading>
        <Spacer/>
        { user !== null ? <UserMenu user={user} logout={logout} /> : <></> }
      </Flex>
    </Box>

  // Cannot wrap the header inside Skeleton because it causes the position: sticky to not work.
  if (loading)
    return skeletonReturn
  else
    return headerReturn
}

export default Header