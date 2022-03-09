/* eslint-disable no-dupe-keys */
import React from 'react'
import { HStack, Skeleton, Box, Flex, Menu, MenuButton, Avatar, Heading,
  MenuList, MenuItem, useColorModeValue, Text, Spacer,
  MenuDivider } from '@chakra-ui/react'

const AvatarNameBox = React.forwardRef((props, ref) => {
  return (
    <HStack as="button" name={props.name} onClick={props.onClick} ref={ref}>
      <Avatar
        name={props.children.props.children}
        size={'sm'}
        src={''}
      />
      <Text>{ props.children.props.children }</Text>
    </HStack>
  )
})

const UserMenu = ({ user, logout }) => {

  const logoutHandler = async () => {
    await logout()
  }

  return (
    <Flex alignItems={'center'} justifyContent={'space-between'}>
      <Menu>
        <MenuButton
          name="user-avatar"
          as={AvatarNameBox}
          rounded={'full'}
          variant={'link'}
          cursor={'pointer'}
          minW={0}>
          {user.name}
        </MenuButton>
        <MenuList name="user-menu">
          { user.role === 'admin' ? <MenuItem>Settings</MenuItem> : <></> }
          <MenuItem>Profile</MenuItem>
          <MenuDivider/>
          <MenuItem name="user-logout" onClick={logoutHandler}>Logout</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  )
}

const Header = ({ loading, user, logout }) => {

  const skeletonReturn = <Skeleton height="20px" />
  const headerReturn =
    <Box sx={{ position: '-webkit-sticky', position: 'sticky', top: 0, 'z-index': 1 }} name="app-header" bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Heading>TrailCam</Heading>
        <Spacer/>
        { user !== null ? <UserMenu user={user} logout={logout} /> : <></> }
      </Flex>
      <div>Silly div for testing</div>
    </Box>

  // Cannot wrap the header inside Skeleton because it causes the position: sticky to not work.
  if (loading)
    return skeletonReturn
  else
    return headerReturn
}

export default Header