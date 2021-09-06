import usersJSON from '../../../test-data/users.json'
import recordingsJSON from '../../../test-data/recordings.json'

describe('Dashboard menu', () => {
  describe('as admin user', () => {
    before(() => {
      cy.seedDb(`{"basicUser": false, "mediaThumbnailUrl": "${Cypress.env('mediaThumbnail')}", "mediaUrl": "${Cypress.env('media')}"}`)
    })

    it('Dashboard shows the user\'s avatar and name and the menu when clicking the avatar', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/recordings',
      }).as('recordingsFetch')

      cy.loginAdmin()

      cy.visit('/dashboard')

      cy.wait('@recordingsFetch')

      cy.get('button[name="user-avatar"]').should('contain', usersJSON.admin.name.charAt())

      cy.get('div[name="app-header"]').should('contain', usersJSON.admin.name)

      cy.get('button[name="user-avatar"]').click()

      cy.get('div[name="user-menu"]').should('exist')

      cy.get('div[name="user-menu"]').should('be.visible')

      cy.get('div[name="user-menu"]').should('contain', 'Profile')
      cy.get('div[name="user-menu"]').should('contain', 'Logout')
      cy.get('div[name="user-menu"]').should('contain', 'Settings')
    })
  })

  describe('as basic user', () => {
    before(() => {
      cy.seedDb(`{"adminUser": false, "mediaThumbnailUrl": "${Cypress.env('mediaThumbnail')}", "mediaUrl": "${Cypress.env('media')}"}`)
    })

    it('Dashboard shows the user\'s avatar and name and the menu when clicking the avatar', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/recordings',
      }).as('recordingsFetch')

      cy.loginBasic()

      cy.visit('/dashboard')

      cy.wait('@recordingsFetch')

      cy.get('button[name="user-avatar"]').should('contain', usersJSON.basic.name.charAt())

      cy.get('div[name="app-header"]').should('contain', usersJSON.basic.name)

      cy.get('button[name="user-avatar"]').click()

      cy.get('div[name="user-menu"]').should('exist')

      cy.get('div[name="user-menu"]').should('be.visible')

      cy.get('div[name="user-menu"]').should('contain', 'Profile')
      cy.get('div[name="user-menu"]').should('contain', 'Logout')
      cy.get('div[name="user-menu"]').should('not.contain', 'Settings')
    })
  })

  //TODO: test closing user menu

  describe('Dashboard with recordings', () => {
    before(() => {
      cy.seedDb(`{"basicUser": false, "mediaThumbnailUrl": "${Cypress.env('mediaThumbnail')}", "mediaUrl": "${Cypress.env('media')}"}`)
    })

    it('Dashboard shows recordings organized by day in chronological order', () => {
      const latestDate = new Date(recordingsJSON[0].recording.mediaDate)

      cy.intercept({
        method: 'GET',
        url: '/api/recordings',
      }).as('recordingsFetch')

      cy.loginAdmin()

      cy.visit('/dashboard')

      cy.wait('@recordingsFetch')

      cy.get('div[name="recordings"]').should('be.visible')

      cy.get('div[name="recording-0"]').should('be.visible')

      cy.get('div[name="recordings"]').should('contain', latestDate.toLocaleDateString())

      cy.get('div[name="recording-0"]').should('contain', latestDate.toLocaleTimeString())

      cy.get('div[name="recording-0"]').within(() => {
        cy.get('img[name="thumbnail-0"]').should('have.attr', 'src', Cypress.env('mediaThumbnail'))
        for (const property in recordingsJSON[0].recording.emailBody) {
          cy.get('ul[name="info-0"]').should('contain', `${property}:`)
          cy.get('ul[name="info-0"]').should('contain', recordingsJSON[0].recording.emailBody[property])
        }
      })
    })
  })
})