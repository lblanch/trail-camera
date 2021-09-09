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
        for (const property in recordingsJSON[0].recording.emailBody) {
          cy.get('ul[name="info-0-0"]').should('contain', `${property}:`)
          cy.get('ul[name="info-0-0"]').should('contain', recordingsJSON[0].recording.emailBody[property])
        }
      })
    })
  })
})