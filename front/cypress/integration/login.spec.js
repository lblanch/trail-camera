import usersJSON from '../../../test-data/users.json'

describe('Login', () => {
  before(() => {
    cy.seedDb('{"recordings": false, "basicUser": false}')
  })

  it('Logs user in successfully', () => {
    cy.visit('/login')

    cy.get('input[name="email"]')
      .type(usersJSON.admin.email)

    cy.get('input[name="password"]')
      .type(usersJSON.admin.password)

    cy.get('button[name="login-button"]')
      .click()

    cy.get('form[name="login-form"]').should('not.exist')

    cy.url().should('eq', Cypress.config().baseUrl + '/')

    cy.getCookie('sid').should('exist')

    cy.get('div[name="notification"]').should('not.exist')

    cy.get('div[name="app-header"]').should('contain', usersJSON.admin.name)
  })

  it('Shows error message and clears form when login is unsuccessful', () => {
    cy.visit('/login')

    cy.get('input[name="email"]')
      .type('wrong.email@email.com')

    cy.get('input[name="password"]')
      .type('wrongpassword')

    cy.get('button[name="login-button"]')
      .click()

    cy.get('input[name="email"]').should('be.empty')
    cy.get('input[name="password"]').should('be.empty')

    cy.get('div[name="notification"]').should('exist')

    cy.url().should('not.include', '/dashboard')

    cy.getCookie('sid').should('not.exist')
  })
})
