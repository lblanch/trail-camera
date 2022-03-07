import usersJSON from '../../../test-data/users.json'

describe('User menu', () => {
  describe('as admin user', () => {
    before(() => {
      cy.seedDb('{"basicUser": false, "recordings": false}')
    })

    it('Dashboard shows the user\'s avatar and name and the menu when clicking the avatar', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/auth',
      }).as('userAuth')

      cy.loginAdmin()

      cy.visit('/')

      cy.wait('@userAuth')

      cy.get('button[name="user-avatar"]').should('contain', usersJSON.admin.name.charAt())

      cy.get('div[name="app-header"]').should('contain', usersJSON.admin.name)

      cy.get('button[name="user-avatar"]').click()

      cy.get('div[name="user-menu"]').should('exist')

      cy.get('div[name="user-menu"]').should('be.visible')

      cy.get('div[name="user-menu"]').should('contain', 'Profile')
      cy.get('div[name="user-menu"]').should('contain', 'Logout')
      cy.get('div[name="user-menu"]').should('contain', 'Settings')

      cy.get('div[name="app-header"]').click()
      cy.get('div[name="user-menu"]').should('not.be.visible')
    })
  })

  describe('as basic user', () => {
    before(() => {
      cy.seedDb('{"adminUser": false, "recordings": false}')
    })

    it('Dashboard shows the user\'s avatar and name and the menu when clicking the avatar', () => {
      cy.intercept({
        method: 'GET',
        url: '/api/auth',
      }).as('userAuth')

      cy.loginBasic()

      cy.visit('/')

      cy.wait('@userAuth')

      cy.get('button[name="user-avatar"]').should('contain', usersJSON.basic.name.charAt())

      cy.get('div[name="app-header"]').should('contain', usersJSON.basic.name)

      cy.get('button[name="user-avatar"]').click()

      cy.get('div[name="user-menu"]').should('exist')

      cy.get('div[name="user-menu"]').should('be.visible')

      cy.get('div[name="user-menu"]').should('contain', 'Profile')
      cy.get('div[name="user-menu"]').should('contain', 'Logout')
      cy.get('div[name="user-menu"]').should('not.contain', 'Settings')

      cy.get('div[name="app-header"]').click()
      cy.get('div[name="user-menu"]').should('not.be.visible')
    })
  })
})