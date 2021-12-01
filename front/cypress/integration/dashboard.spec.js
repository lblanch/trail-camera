import recordingsJSON from '../../../test-data/recordings.json'

describe('Dashboard', () => {
  describe('with recordings', () => {
    before(() => {
      cy.seedDb(`{"basicUser": false, "mediaThumbnailUrl": "${Cypress.env('mediaThumbnail')}", "mediaUrl": "${Cypress.env('media')}"}`)
    })

    it('Dashboard shows recordings organized by day in chronological order', () => {
      const latestDate = new Date(recordingsJSON[0].recording.mediaDate)
      const latestTime = new Date(recordingsJSON[0].recording.mediaDate)
      latestTime.setUTCMinutes(latestTime.getUTCMinutes() + ((recordingsJSON[0].count-1) * 10))

      cy.intercept({
        method: 'GET',
        url: '/api/recordings/**',
      }).as('recordingsFetch')

      cy.loginAdmin()

      cy.visit('/dashboard')

      cy.wait('@recordingsFetch')

      cy.get('div[name="recordings-0"]').should('be.visible')

      cy.get('div[name="recording-0-0"]').should('be.visible')

      cy.get('div[name="recordings-0"]').should('contain', latestDate.toLocaleDateString())

      cy.get('div[name="recording-0-0"]').should('contain', latestTime.toLocaleTimeString())

      cy.get(`div[name="recording-0-${recordingsJSON[0].count - 1}"]`).should('contain', latestDate.toLocaleTimeString())

      cy.get('div[name="recording-0-0"]').within(() => {
        cy.get('img[name="thumbnail-0-0"]').should('have.attr', 'src', Cypress.env('mediaThumbnail'))
        cy.get('ul[name="info-0-0"]').should('contain', 'Date')
        cy.get('ul[name="info-0-0"]').should('contain', 'Time')
        cy.get('ul[name="info-0-0"]').should('contain', new Date(recordingsJSON[0].recording.mediaDate).toLocaleDateString())
        cy.get('ul[name="info-0-0"]').should('contain', latestTime.toLocaleTimeString())
      })
    })

    it('When scrolling, further recordings are fetched and displayed', () => {
      const latestDate = new Date(recordingsJSON[1].recording.mediaDate)
      const latestTime = new Date(recordingsJSON[1].recording.mediaDate)
      latestTime.setUTCMinutes(latestTime.getUTCMinutes() + ((recordingsJSON[1].count-1) * 10))

      cy.intercept({
        method: 'GET',
        url: '/api/recordings/**',
      }).as('recordingsFetch')

      cy.loginAdmin()

      cy.visit('/dashboard')

      cy.wait('@recordingsFetch')

      cy.scrollTo('bottom')

      cy.wait('@recordingsFetch')

      cy.get('div[name="recordings-1"]').should('be.visible')

      cy.get('div[name="recording-1-0"]').should('be.visible')

      cy.get('div[name="recordings-1"]').should('contain', latestDate.toLocaleDateString())

      cy.get('div[name="recording-1-0"]').should('contain', latestTime.toLocaleTimeString())

      cy.get(`div[name="recording-1-${recordingsJSON[0].count - 1}"]`).should('contain', latestDate.toLocaleTimeString())

      cy.get('div[name="recording-1-0"]').within(() => {
        cy.get('img[name="thumbnail-1-0"]').should('have.attr', 'src', Cypress.env('mediaThumbnail'))
        cy.get('ul[name="info-1-0"]').should('contain', 'Date')
        cy.get('ul[name="info-1-0"]').should('contain', 'Time')
        cy.get('ul[name="info-1-0"]').should('contain', new Date(recordingsJSON[1].recording.mediaDate).toLocaleDateString())
        cy.get('ul[name="info-1-0"]').should('contain', latestTime.toLocaleTimeString())
      })
    })

    it('When scrolling, but session has expired, user is sent back to /login', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/recordings/**',
      }).as('recordingsFetch')

      cy.loginAdmin()

      cy.visit('/dashboard')

      cy.wait('@recordingsFetch')

      cy.get('div[name="recordings-0"]').should('be.visible')

      cy.clearCookies()

      cy.scrollTo('bottom')

      cy.wait('@recordingsFetch')

      cy.url().should('include', 'login')
    })
  })
})