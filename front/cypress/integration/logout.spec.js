describe('Logout', () => {
  before(() => {
    const options = '{"recordings": false, "adminUser": true, "basicUser": false}'
    const url = 'http://localhost:3000/public/img.jpg'
    cy.exec(`npm run --prefix ../back seed:dev -- ${url} ${url} '${options}'`)
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

    //TODO: check that logout message shows
  })
})