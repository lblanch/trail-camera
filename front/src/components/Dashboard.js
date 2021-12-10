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

const DayRecordings = ({ dayIndex, dayDate, dayRecordings }) => {
  return (
    <Box name={`recordings-${dayIndex}`} p={4}>
      <Heading>{ new Date(dayDate).toLocaleDateString()}</Heading>
      <SimpleGrid minChildWidth="300px" spacing="40px" py={4}>
        {
          dayRecordings.map((recording, index) => {
            return (
              <RecordingCard dayIndex={dayIndex} index={index} recording={recording} key={recording._id} />
            )
          })
        }
      </SimpleGrid>
    </Box>
  )
}

const Dashboard = ({ errorHandler }) => {
  const MAX_RECORDINGS = 3

  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchParams, setFetchParams] = useState({ endpoint: 'before', requestedDate: new Date().toISOString() })
  const [isLastPage, setIsLastPage] = useState(true)
  const [isFirstPage, setIsFirstPage] = useState(true)

  const observerLast = useRef()
  const observerFirst = useRef()

  const lastRecordingRef = useCallback((lastRecording) => {
    if (loading) {
      return
    }

    if (observerLast.current) {
      observerLast.current.disconnect()
    }

    observerLast.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLastPage) {
        const newFetchParams = { endpoint: 'before', requestedDate: recordings[recordings.length - 1].recordings[recordings[recordings.length - 1].recordings.length - 1].mediaDate }
        setFetchParams(newFetchParams)
      }
    })

    if (lastRecording) {
      observerLast.current.observe(lastRecording)
    }
  }, [loading, isLastPage, recordings])

  const firstRecordingRef = useCallback((firstRecording) => {
    if (loading) {
      return
    }

    if (observerFirst.current) {
      observerFirst.current.disconnect()
    }

    observerFirst.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isFirstPage) {
        const newFetchParams = { endpoint: 'after', requestedDate: recordings[0].recordings[0].mediaDate }
        setFetchParams(newFetchParams)
      }
    })

    if (firstRecording) {
      observerFirst.current.observe(firstRecording)
    }
  }, [loading, isFirstPage, recordings])

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const responseRecordings = await recordingsServices.getRecordingsByDate(fetchParams.endpoint, fetchParams.requestedDate)
        if (fetchParams.endpoint === 'before') {
          if (responseRecordings.count !== 0) {
            setRecordings((prevRecordings) => {
              const newRecordings = [...prevRecordings]
              if (newRecordings.length >= MAX_RECORDINGS) {
                setIsFirstPage(false)
                return newRecordings.slice(1).concat(responseRecordings)
              }
              return newRecordings.concat(responseRecordings)
            })
            setIsLastPage(false)
          } else {
            setIsLastPage(true)
          }
        } else {
          if (responseRecordings.count !== 0) {
            setRecordings((prevRecordings) => {
              const newRecordings = [...prevRecordings]
              if (newRecordings.length >= MAX_RECORDINGS) {
                setIsLastPage(false)
                return [responseRecordings, ...newRecordings.slice(0, -1)]
              }
              return [responseRecordings, ...newRecordings]
            })
            setIsFirstPage(false)
          } else {
            setIsFirstPage(true)
          }
        }
        setLoading(false)
      } catch(error) {
        if (fetchParams.endpoint === 'before') {
          setIsLastPage(true)
        } else {
          setIsFirstPage(true)
        }
        setLoading(false)
        errorHandler(error)
      }
    }
    setLoading(true)
    fetchRecordings()
  }, [fetchParams, errorHandler])

  const processDays = () => {
    let days = []
    let recordingsArray = []
    let dayId = 0

    for (let i = 0; i < recordings.length; i++) {
      recordingsArray = recordingsArray.concat(recordings[i].recordings)
      if (dayId === 0) {
        dayId = recordings[i]._id
      }
      if (i + 1 < recordings.length) {
        if (recordings[i + 1].date !== recordings[i].date) {
          days.push(<DayRecordings key={dayId}  dayIndex={i} dayDate={recordings[i].date} dayRecordings={recordingsArray} />)
          dayId = 0
          recordingsArray = []
        }
      } else {
        days.push(<DayRecordings key={dayId}  dayIndex={i} dayDate={recordings[i].date} dayRecordings={recordingsArray} />)
      }
    }
    return days
  }

  return (
    <>
      <div ref={firstRecordingRef} />
      { processDays() }
      <Skeleton isLoaded={!loading} height="20px">
        <div ref={lastRecordingRef}>{recordings.length === 0 && isLastPage === true && 'No results'}</div>
      </Skeleton>
    </>
  )
}

export default Dashboard