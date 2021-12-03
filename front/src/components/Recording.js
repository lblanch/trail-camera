/* eslint-disable no-dupe-keys */
import { Link as RouterLink } from 'react-router-dom'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { Link, IconButton, Flex, Container, List, Stack, WrapItem,
  ListItem, ListIcon, Image, Wrap, Tag, TagLeftIcon, TagLabel,
  TagCloseButton } from '@chakra-ui/react'
import { FaArrowLeft, FaTag, FaCircle, FaThermometerHalf, FaCalendarAlt, FaClock } from 'react-icons/fa'

const RecordingVideo = ({ videoUrl, mediaType }) => {
  return (
    <video controls>
      <source src={videoUrl} type={mediaType}/>
    </video>
  )
}

const Recording = (props) => {
  // TODO: if we didn't receive a recording, fetch it from the server with the recording id
  //const { recordingId } = useParams()
  const location = useLocation()
  const { recording } = location.state
  const mediaTypeSplit = recording.mediaType.split('/')

  return (
    <Container maxW={'5xl'}>
      <Link as={RouterLink} to="/dashboard">
        <IconButton aria-label="Go back" icon={<FaArrowLeft />} sx={{ position: '-webkit-sticky', position: 'sticky', top: '80px' }} />
      </Link>
      <Stack
        textAlign={'center'}
        align={'center'}
        spacing={10}
        py={8}>
        <Flex w={'full'}>
          { mediaTypeSplit[0] === 'image'
            ? <Image src={recording.mediaURL} alt="Trail camera picture" />
            : <RecordingVideo videoUrl={recording.mediaURL} mediaType={recording.mediaType} />
          }
        </Flex>
        <Stack direction={{ base: 'column', md: 'row' }}>
          <Flex flex={1} textAlign={'left'}>
            <List spacing={3}>
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
          </Flex>
          <Flex flex={1}>
            <Wrap spacing="10px" justify="left" py={{ base: 4, md: 0 }}>
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
          </Flex>
        </Stack>
      </Stack>
    </Container>
  )
}

export default Recording