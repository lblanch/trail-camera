describe('Login in', () => {
  it('Logs user in successfully', () => {
    cy.visit('/login')

    cy.get('input[name="email"]')
      .type('person1@email.com')

    cy.get('input[name="password"]')
      .type('123456789101112')

    cy.get('button[name="login-button"]')
      .click()

    cy.get('form[name="login-form"]').should('not.exist')

    // we should be redirected to /dashboard
    cy.url().should('include', '/dashboard')

    // our auth cookie should be present
    cy.getCookie('sid').should('exist')

    // UI should reflect this user being logged in
    cy.get('h1').should('contain', 'Person1')
  })
})
