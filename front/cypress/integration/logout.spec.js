describe('Logout', () => {
  before(() => {
    cy.seedDb('{"recordings": false, "basicUser": false}')
  })

  it('Logs user out successfully', () => {
    cy.intercept({
      method: 'GET',
      url: '/api/auth',
    }).as('userAuth')

    cy.loginAdmin()

    cy.visit('/dashboard')

    cy.wait('@userAuth')

    cy.get('button[name="user-avatar"]')
      .click()

    cy.get('div[name="user-menu"]')
      .should('exist')

    cy.get('div[name="user-menu"]')
      .should('be.visible')

    cy.get('div[name="user-menu"]').get('button[name="user-logout"]')
      .click()

    cy.url().should('include', '/login')

    cy.getCookie('sid').should('not.exist')

    cy.get('div[name="notification"]').should('exist')
  })
})