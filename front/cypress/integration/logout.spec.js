describe('Logout', () => {
  before(() => {
    const options = '{"recordings": false, "basicUser": false}'
    cy.exec(`npm run --prefix ../back seed:dev -- '${options}'`)
      .then((result) => {
        console.log(result.stdout)
      })
      .its('code').should('eq', 0)
  })

  it('Logs user out successfully', () => {
    cy.intercept({
      method: 'GET',
      url: '/api/auth',
    }).as('authCheck')

    cy.loginAdmin()

    cy.visit('/dashboard')

    cy.wait('@authCheck')

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