import { Link as RouterLink } from 'react-router-dom'
import { Center, Skeleton, Box, useColorModeValue, SimpleGrid, Heading,
  Image, List, ListItem, ListIcon, LinkBox, Tag,
  TagLabel, TagLeftIcon, TagCloseButton, Wrap, WrapItem,
  LinkOverlay } from '@chakra-ui/react'
import { FaClock, FaCalendarAlt, FaTag } from 'react-icons/fa'
import React, { useState, useRef, useCallback } from 'react'

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

  const [infiniteScroll, setInfiniteScroll] = useState({ recordings: [], loading: false, isLastPage: false, isFirstPage: true })

  const observerLast = useRef()
  const observerFirst = useRef()

  const fetchRecordings = useCallback(async (fetchParams) => {
    try {
      const responseRecordings = await recordingsServices.getRecordingsByDate(fetchParams.endpoint, fetchParams.requestedDate)
      if (fetchParams.endpoint === 'before') {
        if (responseRecordings.count !== 0) {
          setInfiniteScroll((prevInfiniteScroll) => {
            const newInfiniteScroll = {
              recordings: [],
              loading: false,
              isLastPage: false,
              isFirstPage: prevInfiniteScroll.isFirstPage
            }
            const newRecordings = [...prevInfiniteScroll.recordings]
            if (newRecordings.length >= MAX_RECORDINGS) {
              newInfiniteScroll.isFirstPage = false
              newInfiniteScroll.recordings = newRecordings.slice(1).concat(responseRecordings)
              return newInfiniteScroll
            }
            newInfiniteScroll.recordings = newRecordings.concat(responseRecordings)
            return newInfiniteScroll
          })
        } else {
          setInfiniteScroll((prevInfiniteScroll) => {
            const newInfiniteScroll = {
              recordings: prevInfiniteScroll.recordings,
              loading: false,
              isLastPage: true,
              isFirstPage: prevInfiniteScroll.isFirstPage
            }
            return newInfiniteScroll
          })
        }
      } else {
        if (responseRecordings.count !== 0) {
          setInfiniteScroll((prevInfiniteScroll) => {
            const newInfiniteScroll = {
              recordings: [],
              loading: false,
              isLastPage: prevInfiniteScroll.isLastPage,
              isFirstPage: false
            }
            const newRecordings = [...prevInfiniteScroll.recordings]
            if (newRecordings.length >= MAX_RECORDINGS) {
              newInfiniteScroll.isLastPage = false
              newInfiniteScroll.recordings = [responseRecordings, ...newRecordings.slice(0, -1)]
              return newInfiniteScroll
            }
            newInfiniteScroll.recordings = [responseRecordings, ...newRecordings]
            return newInfiniteScroll
          })
        } else {
          setInfiniteScroll((prevInfiniteScroll) => {
            const newInfiniteScroll = {
              recordings: prevInfiniteScroll.recordings,
              loading: false,
              isLastPage: prevInfiniteScroll.isLastPage,
              isFirstPage: true
            }
            return newInfiniteScroll
          })
        }
      }
    } catch(error) {
      if (fetchParams.endpoint === 'before') {
        setInfiniteScroll((prevInfiniteScroll) => {
          const newInfiniteScroll = {
            recordings: prevInfiniteScroll.recordings,
            loading: false,
            isLastPage: true,
            isFirstPage: prevInfiniteScroll.isFirstPage
          }
          return newInfiniteScroll
        })
      } else {
        setInfiniteScroll((prevInfiniteScroll) => {
          const newInfiniteScroll = {
            recordings: prevInfiniteScroll.recordings,
            loading: false,
            isLastPage: prevInfiniteScroll.isLastPage,
            isFirstPage: true
          }
          return newInfiniteScroll
        })

      }
      errorHandler(error)
    }
  }, [errorHandler])

  const lastRecordingRef = useCallback((lastRecording) => {
    if (infiniteScroll.loading) {
      return
    }

    if (observerLast.current) {
      observerLast.current.disconnect()
    }

    observerLast.current = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting && !infiniteScroll.isLastPage) {
        const newFetchParams = { endpoint: 'before', requestedDate: new Date().toISOString() }
        if (infiniteScroll.recordings.length > 0) {
          newFetchParams.requestedDate= infiniteScroll.recordings[infiniteScroll.recordings.length - 1].recordings[infiniteScroll.recordings[infiniteScroll.recordings.length - 1].recordings.length - 1].mediaDate
        }
        await fetchRecordings(newFetchParams)
      }
    }, { rootMargin:  '0px 0px 500px 0px' })

    if (lastRecording) {
      observerLast.current.observe(lastRecording)
    }
  }, [infiniteScroll, fetchRecordings])

  const firstRecordingRef = useCallback((firstRecording) => {
    if (infiniteScroll.loading) {
      return
    }

    if (observerFirst.current) {
      observerFirst.current.disconnect()
    }

    observerFirst.current = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting && !infiniteScroll.isFirstPage) {
        const newFetchParams = { endpoint: 'after', requestedDate: new Date().toISOString() }
        if (infiniteScroll.recordings.length > 0) {
          newFetchParams.requestedDate = infiniteScroll.recordings[0].recordings[0].mediaDate
        }
        await fetchRecordings(newFetchParams)
      }
    }, { rootMargin:  '500px 0px 0px 0px' })

    if (firstRecording) {
      observerFirst.current.observe(firstRecording)
    }
  }, [infiniteScroll, fetchRecordings])

  const processDays = () => {
    let days = []
    let recordingsArray = []
    let dayId = 0

    for (let i = 0; i < infiniteScroll.recordings.length; i++) {
      recordingsArray = recordingsArray.concat(infiniteScroll.recordings[i].recordings)
      if (dayId === 0) {
        dayId = infiniteScroll.recordings[i]._id
      }
      if (i + 1 < infiniteScroll.recordings.length) {
        if (infiniteScroll.recordings[i + 1].date !== infiniteScroll.recordings[i].date) {
          days.push(<DayRecordings key={dayId}  dayIndex={i} dayDate={infiniteScroll.recordings[i].date} dayRecordings={recordingsArray} />)
          dayId = 0
          recordingsArray = []
        }
      } else {
        days.push(<DayRecordings key={dayId}  dayIndex={i} dayDate={infiniteScroll.recordings[i].date} dayRecordings={recordingsArray} />)
      }
    }
    return days
  }

  return (
    <>
      <div ref={firstRecordingRef} />
      { processDays() }
      <Skeleton isLoaded={!infiniteScroll.loading} height="20px">
        <div ref={lastRecordingRef}>{infiniteScroll.recordings.length === 0 && infiniteScroll.isLastPage === true && 'No results'}</div>
      </Skeleton>
    </>
  )
}

export default Dashboard