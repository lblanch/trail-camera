describe('Login in', () => {
  before(() => {
    const options = '{"recordings": false, "adminUser": true, "basicUser": false}'
    const url = 'http://localhost:3000/public/img.jpg'
    cy.exec(`npm run --prefix ../back seed:dev -- ${url} ${url} '${options}'`)
      .then((result) => {
        console.log(result.stdout)
      })
      .its('code').should('eq', 0)
  })

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

    cy.get('div[name="notification"]').should('not.exist')

    // UI should reflect this user being logged in
    cy.get('h1').should('contain', 'Person1')
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
