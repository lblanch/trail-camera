import { Link as RouterLink } from 'react-router-dom'
import { Center, Skeleton, Box, useColorModeValue, SimpleGrid, Heading,
  Image, List, ListItem, ListIcon, LinkBox, Tag,
  TagLabel, TagLeftIcon, TagCloseButton, Wrap, WrapItem,
  LinkOverlay } from '@chakra-ui/react'
import { FaClock, FaCalendarAlt, FaTag } from 'react-icons/fa'
import React, { useState, useEffect, useRef, useCallback } from 'react'

import recordingsServices from '../services/recordings'

const RecordingCard = ({ dayIndex, index, recording }) => {
  return(
    <LinkBox as={Center} name={`recording-${dayIndex}-${index}`}>
      <Box maxW={'445px'} w={'full'} bg={useColorModeValue('white', 'gray.900')} boxShadow={'2xl'} rounded={'md'} p={4} overflow={'hidden'}>
        <Box bg={'gray.100'} mt={-6} mx={-6} mb={6} pos={'relative'}>
          <Image name={`thumbnail-${dayIndex}-${index}`} src={recording.mediaThumbnailURL} layout={'fill'} />
        </Box>
        <List name={`info-${dayIndex}-${index}`} spacing={3}>
          <ListItem>
            <ListIcon as={FaCalendarAlt} color="green.500" />
            <LinkOverlay as={RouterLink} to={{ pathname: `/dashboard/${recording._id}`, state: { recording: recording } }}>
              <b>Date</b> {new Date(recording.mediaDate).toLocaleDateString()}
            </LinkOverlay>
          </ListItem>
          <ListItem>
            <ListIcon as={FaClock} color="green.500" />
            <b>Time:</b> {new Date(recording.mediaDate).toLocaleTimeString()}
          </ListItem>
        </List>
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
    </LinkBox>
  )
}

const DayRecordings = ({ dayIndex, dayRecordings }) => {
  return (
    <Box name={`recordings-${dayIndex}`} p={4}>
      <Heading>{ new Date(dayRecordings.date).toLocaleDateString()}</Heading>
      <SimpleGrid minChildWidth="300px" spacing="40px" py={4}>
        {
          dayRecordings.recordings.map((recording, index) => {
            return (
              <RecordingCard dayIndex={dayIndex} index={index} recording={recording} key={recording._id} />
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
  const [page, setPage] = useState(1)
  const [isLastPage, setIsLastPage] = useState(true)

  const observer = useRef()
  const lastRecordingRef = useCallback((lastRecording) => {
    if (loading) {
      return
    }

    if (observer.current) {
      observer.current.disconnect()
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLastPage) {
        setPage(prevPageNumber => prevPageNumber + 1)
      }
    })

    if (lastRecording) {
      observer.current.observe(lastRecording)
    }
  }, [loading, isLastPage])

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const responseRecordings = await recordingsServices.getRecordingsByPage(page)
        if (responseRecordings.count !== 0) {
          setRecordings((prevRecordings) => {
            const prevRecordingsLength = prevRecordings.length
            if(prevRecordingsLength === 0) {
              return [responseRecordings]
            }

            //If received recordings belong to an existing date: merge, otherwise, add at the end of array
            if (prevRecordings[prevRecordingsLength - 1].date === responseRecordings.date) {
              const newRecording = {
                _id: prevRecordings[prevRecordingsLength - 1]._id,
                count: prevRecordings[prevRecordingsLength - 1].count + responseRecordings.count,
                date: responseRecordings.date,
                recordings: prevRecordings[prevRecordingsLength - 1].recordings.concat(responseRecordings.recordings)
              }

              return [...prevRecordings.slice(0, -1), newRecording]
            } else {
              return [...prevRecordings, responseRecordings]
            }
          })
          setIsLastPage(false)
        } else {
          setIsLastPage(true)
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
    setLoading(true)
    fetchRecordings()
  }, [page])

  return (
    <>
      {
        recordings.map((dayRecording, index) => {
          return (
            <DayRecordings key={dayRecording._id}  dayIndex={index} dayRecordings={dayRecording} />
          )
        })
      }
      <Skeleton isLoaded={!loading} height="20px">
        <div ref={lastRecordingRef}>{page === 1 && isLastPage === true && 'No results'}</div>
      </Skeleton>
    </>
  )
}

export default Dashboard