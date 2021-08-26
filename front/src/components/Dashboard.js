import { Skeleton, Box, Flex, Menu, MenuButton, Avatar, Heading,
  MenuList, MenuItem, Button, useColorModeValue, Text, Spacer, MenuDivider } from '@chakra-ui/react'
import React from 'react'

const Dashboard = ({ user, loading, logout }) => {
  const logoutHandler = async () => {
    await logout()
  }

  return (
    <Skeleton isLoaded={!loading}>
      <Box name="app-header" bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Heading>{'TrailCam'}</Heading>
          <Spacer/>
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
                  name={ user === null ? '' : user.name }
                  size={'sm'}
                  src={''}
                />
              </MenuButton>
              <MenuList name="user-menu">
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuDivider/>
                <MenuItem name="user-logout" onClick={logoutHandler}>Logout</MenuItem>
              </MenuList>
            </Menu>
            <Box p={3}>
              <Text>{ user === null ? 'Loading user' : user.name }</Text>
            </Box>
          </Flex>
        </Flex>
      </Box>
    </Skeleton>
  )
}

export default Dashboard