import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import recordingsJSON from '../../../test-data/recordings.json'
import recordingsServices from '../services/recordings'
import Dashboard from '../components/Dashboard'

describe('<Dashboard />', () => {
  const mockErrorHandler = jest.fn()

  describe('when the observed element is visible', () => {
    beforeAll(() => {
      window.IntersectionObserver = function(callback) {
        return {
          observe: jest.fn().mockImplementation((element) => {
            callback([{ isIntersecting: true, target: element }])
          }),
          disconnect: jest.fn().mockImplementation(() => {
          }),
        }
      }
    })

    test('when there is no recordings, tries to fetch them only once, shows skeleton while fetching and then a no results message', async  () => {
      const mockRecordingsFetch = jest.spyOn(recordingsServices, 'getRecordingsByDate')
        .mockImplementation((endpoint, requestedDate) => {
          return Promise.resolve({ count: 0 })
        })
      const currentDate = new Date()

      render(<Dashboard errorHandler={mockErrorHandler} />)
      await screen.findByText('No results')

      const receivedEndpoint = mockRecordingsFetch.mock.calls[0][0]
      const receivedDate = new Date(mockRecordingsFetch.mock.calls[0][1])

      expect(screen.queryByText('No results')).toBeVisible()
      expect(mockRecordingsFetch).toHaveBeenCalledTimes(1)
      expect(receivedEndpoint).toEqual('before')
      expect(receivedDate - currentDate).toBeLessThan(5000)
      expect(mockErrorHandler).toHaveBeenCalledTimes(0)
    })

    test('when there is recordings, fetches next page until count = 0 is returned', async  () => {
      const dateToShow = new Date()
      const mockRecordingsFetch = jest.spyOn(recordingsServices, 'getRecordingsByDate')
        .mockImplementationOnce((endpoint, requestedDate) => {
          return Promise.resolve({
            _id: 'testId',
            count: 2,
            date: dateToShow,
            recordings: [
              {
                _id: 'ifForFirstRecording',
                tags: [],
                ...recordingsJSON[0].recording
              },
              {
                _id: 'ifForSecondRecording',
                tags: [],
                ...recordingsJSON[0].recording
              },
            ]
          })
        })
        .mockImplementationOnce((endpoint, requestedDate) => {
          return Promise.resolve({ count: 0 })
        })
      const currentDate = new Date()

      render(<BrowserRouter><Dashboard errorHandler={mockErrorHandler} /></BrowserRouter>)
      await screen.findByText(dateToShow.toLocaleDateString())

      const receivedDateFirst = new Date(mockRecordingsFetch.mock.calls[0][1])
      const receivedDateSecond = new Date(mockRecordingsFetch.mock.calls[1][1])

      expect(screen.queryByText(dateToShow.toLocaleDateString())).toBeVisible()
      expect(mockRecordingsFetch).toHaveBeenCalledTimes(2)
      expect(mockRecordingsFetch.mock.calls[0][0]).toEqual('before')
      expect(mockRecordingsFetch.mock.calls[1][0]).toEqual('before')
      expect(receivedDateFirst - currentDate).toBeLessThan(5000)
      expect(receivedDateSecond - dateToShow).toBeLessThan(5000)
    })
  })

  describe('when the observed element is not visible', () => {
    beforeAll(() => {
      window.IntersectionObserver = function(callback) {
        return {
          observe: jest.fn().mockImplementation((element) => {
            callback([{ isIntersecting: false, target: element }])
          }),
          disconnect: jest.fn().mockImplementation(() => {
          }),
        }
      }
    })

    test('no fetching attempts are made', async  () => {
      const mockRecordingsFetch = jest.spyOn(recordingsServices, 'getRecordingsByDate')
        .mockImplementation((endpoint, requestedDate) => {
          return Promise.resolve({ count: 0 })
        })

      render(<Dashboard errorHandler={mockErrorHandler} />)

      expect(mockRecordingsFetch).toHaveBeenCalledTimes(0)
    })
  })
})