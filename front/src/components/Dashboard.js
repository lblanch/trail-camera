import { Skeleton, Box, useColorModeValue, SimpleGrid, Heading,
  Image, List, ListItem, ListIcon, Center, Stack, Tag,
  TagLabel, TagLeftIcon, TagCloseButton, Wrap, WrapItem } from '@chakra-ui/react'
import { FaThermometerHalf, FaClock, FaCalendarAlt,
  FaCircle, FaTag } from 'react-icons/fa'
import React, { useState, useEffect } from 'react'

import recordingsServices from '../services/recordings'

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

const Dashboard = () => {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(false)
  //const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const responseRecordings = await recordingsServices.getInitialRecordings()
        if (responseRecordings.count !== 0) {
          setRecordings(responseRecordings.recordings)
        } else {
          setRecordings([])
        }
      } catch(error) {
        if(error.response) {
          if (error.response.data.error)
            console.log(error.response.data.error)
          else
            console.log(error.response.data)
        } else {
          console.log(error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecordings()
  }, [])

  return (
    <Skeleton isLoaded={!loading}>
      {
        recordings.length !== 0
          ? <Recordings recordings={recordings}/>
          : <></>
      }
    </Skeleton>
  )
}

export default Dashboard