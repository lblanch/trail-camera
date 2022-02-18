import React from 'react'
import { Flex, Center, List, Stack, WrapItem, ListItem, ListIcon,
  Image, Wrap, Tag, TagLeftIcon, TagLabel, TagCloseButton } from '@chakra-ui/react'
import { FaTag, FaCircle, FaThermometerHalf, FaCalendarAlt, FaClock } from 'react-icons/fa'

const RecordingVideo = ({ videoUrl, mediaType }) => {
  return (
    <video controls>
      <source src={videoUrl} type={mediaType} crossorigin />
    </video>
  )
}

const Recording = ({ recording }) => {
  const mediaTypeSplit = recording.mediaType.split('/')

  return (
    <Center>
      <Stack
        textAlign={'center'}
        align={'center'}
        spacing={10}
        py={8}>
        <Flex w={'full'}>
          { mediaTypeSplit[0] === 'image'
            ? <Image src={recording.mediaURL} alt="Trail camera picture" crossorigin />
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
    </Center>
  )
}

export default Recording