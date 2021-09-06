import { Skeleton, Box, Flex, Menu, MenuButton, Avatar, Heading,
  MenuList, MenuItem, Button, useColorModeValue, Text, Spacer, MenuDivider,
  SimpleGrid, Image, List, ListItem, ListIcon, Center, Stack, Tag, TagLabel,
  TagLeftIcon, TagCloseButton, Wrap, WrapItem } from '@chakra-ui/react'
import { FaThermometerHalf, FaClock, FaCalendarAlt,
  FaCircle, FaTag } from 'react-icons/fa'
import React from 'react'

const Recording = ({ index, recording }) => {
  return(
    <Center name={`recording-${index}`}>
      <Box maxW={'445px'} w={'full'} bg={useColorModeValue('white', 'gray.900')} boxShadow={'2xl'} rounded={'md'} p={4} overflow={'hidden'}>
        <Box bg={'gray.100'} mt={-6} mx={-6} mb={6} pos={'relative'}>
          <Image name={`thumbnail-${index}`} src={recording.mediaThumbnailURL} layout={'fill'} />
        </Box>
        <Stack>
          <Heading color={useColorModeValue('gray.700', 'white')} fontSize={'2xl'} fontFamily={'body'}>
            {new Date(recording.mediaDate).toLocaleTimeString()}
          </Heading>
          <List name={`info-${index}`} spacing={3}>
            {
              Object.entries(recording.emailBody).map(([k, v]) => {
                let icon = FaCircle
                if (k === 'temperature') {
                  icon = FaThermometerHalf
                } else if (k === 'date') {
                  icon = FaCalendarAlt
                } else if (k === 'time') {
                  icon = FaClock
                }
                return (
                  <ListItem key={k}>
                    <ListIcon as={icon} color="green.500" />
                    <b>{k}:</b> {v}
                  </ListItem>
                )
              })
            }
          </List>
        </Stack>
        <Wrap spacing="10px" justify="left" py={4}>
          {
            recording.tags.map((tag) => {
              return (
                <WrapItem key={tag._id}>
                  <Tag variant="subtle" colorScheme={tag.color}>
                    <TagLeftIcon boxSize="12px" as={FaTag} />
                    <TagLabel>{tag.tag}</TagLabel>
                    <TagCloseButton />
                  </Tag>
                </WrapItem>
              )
            })
          }
        </Wrap>
      </Box>
    </Center>
  )
}

const Recordings = ({ recordings }) => {
  return (
    <Box name="recordings" p={4}>
      <Heading>{ new Date(recordings[0].mediaDate).toLocaleDateString()}</Heading>
      <SimpleGrid minChildWidth="300px" spacing="40px" py={4}>
        {
          recordings.map((recording, index) => {
            return (
              <Recording index={index} recording={recording} key={index} />
            )
          })
        }
      </SimpleGrid>
    </Box>
  )
}

const Dashboard = ({ user, loading, logout, recordings }) => {
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
                {user !== null && user.role === 'admin' ? <MenuItem>Settings</MenuItem> : <></> }
                <MenuItem>Profile</MenuItem>
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
      {
        recordings.length !== 0
          ? <Recordings recordings={recordings}/>
          : <></>
      }
    </Skeleton>
  )
}

export default Dashboard