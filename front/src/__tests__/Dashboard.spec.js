import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import recordingsJSON from '../../../test-data/recordings.json'
import recordingsServices from '../services/recordings'
import Dashboard from '../components/Dashboard'

describe('<Dashboard />', () => {
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
      const mockRecordingsFetch = jest.spyOn(recordingsServices, 'getRecordingsByPage')
        .mockImplementation((page) => {
          return Promise.resolve({ count: 0 })
        })

      render(<Dashboard />)
      await screen.findByText('No results')
      expect(screen.queryByText('No results')).toBeVisible()
      expect(mockRecordingsFetch).toHaveBeenCalledTimes(1)
      expect(mockRecordingsFetch).toHaveBeenCalledWith(1)
    })

    test('when there is recordings, fetches next page until count = 0 is returned', async  () => {
      const dateToShow = new Date()
      const mockRecordingsFetch = jest.spyOn(recordingsServices, 'getRecordingsByPage')
        .mockImplementationOnce((page) => {
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
        .mockImplementationOnce((page) => {
          return Promise.resolve({ count: 0 })
        })

      render(<BrowserRouter><Dashboard /></BrowserRouter>)
      await screen.findByText(dateToShow.toLocaleDateString())
      expect(screen.queryByText(dateToShow.toLocaleDateString())).toBeVisible()
      expect(mockRecordingsFetch).toHaveBeenCalledTimes(2)
      expect(mockRecordingsFetch).toHaveBeenNthCalledWith(1, 1)
      expect(mockRecordingsFetch).toHaveBeenNthCalledWith(2, 2)
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

    test('when there is no recordings, tries to fetch them only once, shows skeleton while fetching and then a no results message', async  () => {
      const mockRecordingsFetch = jest.spyOn(recordingsServices, 'getRecordingsByPage')
        .mockImplementation((page) => {
          return Promise.resolve({ count: 0 })
        })

      render(<Dashboard />)
      await screen.findByText('No results')
      expect(screen.queryByText('No results')).toBeVisible()
      expect(mockRecordingsFetch).toHaveBeenCalledTimes(1)
      expect(mockRecordingsFetch).toHaveBeenCalledWith(1)
    })

    test('when there is recordings, fetches only first page', async  () => {
      const dateToShow = new Date()
      const mockRecordingsFetch = jest.spyOn(recordingsServices, 'getRecordingsByPage')
        .mockImplementation((page) => {
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

      render(<BrowserRouter><Dashboard /></BrowserRouter>)
      await screen.findByText(dateToShow.toLocaleDateString())
      expect(screen.queryByText(dateToShow.toLocaleDateString())).toBeVisible()
      expect(mockRecordingsFetch).toHaveBeenCalledTimes(1)
      expect(mockRecordingsFetch).toHaveBeenCalledWith(1)
    })
  })
})