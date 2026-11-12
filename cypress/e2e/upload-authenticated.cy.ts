describe('Authenticated upload and download', () => {
  const filePassword = 'file-secret-456';
  let downloadToken: string;
  let testUser: { email: string; password: string };

  before(() => {
    cy.fixture('test-user.json').then((user) => {
      testUser = user;
    });
  });

  // Authenticate the test user and preserve the session.
  const authenticate = () => {
    cy.session(['data-share-user', testUser.email], () => {
      cy.intercept('POST', '/api/auth/login').as('login');

      cy.visit('/login');

      cy.get('#login').type(testUser.email);
      cy.get('#password').type(testUser.password, { log: false });
      cy.get('button[type="submit"]').click();

      cy.wait('@login').then(({ response }) => {
        if (response?.statusCode === 200) {
          return;
        }

        expect(response?.statusCode).to.eq(401);

        // Register the user if the login fails.
        cy.visit('/register');

        cy.intercept('POST', '/api/auth/register').as('register');

        cy.get('#register-email').type(testUser.email);
        cy.get('#register-password').type(testUser.password, { log: false });
        cy.get('#register-password-confirmation')
          .type(testUser.password, { log: false });

        cy.on('window:alert', () => {});

        cy.get('button[type="submit"]').click();

        cy.wait('@register').then(({ response: registerResponse }) => {
          expect(registerResponse?.statusCode).to.be.oneOf([200, 201, 400]);
        });

        // Login after registration.
        cy.visit('/login');

        cy.intercept('POST', '/api/auth/login').as('loginAfterRegister');

        cy.get('#login').type(testUser.email);
        cy.get('#password').type(testUser.password, { log: false });
        cy.get('button[type="submit"]').click();

        cy.wait('@loginAfterRegister')
          .its('response.statusCode')
          .should('eq', 200);
      });
    });
  };

  it('E2E-01 - should authenticate the test user', () => {
    authenticate();

    cy.visit('/');
    cy.contains('button, a', 'Mon espace').should('be.visible');
  });

  it('E2E-02 - should upload a file when authenticated', () => {
    authenticate();

    cy.intercept('POST', '/api/auth/files').as('uploadFile');

    cy.visit('/');

    // Select a real file.
    cy.get('input[type="file"]')
      .selectFile('cypress/fixtures/authenticated-test.txt', { force: true });

    // Verify navigation to the upload page.
    cy.location('pathname').should('eq', '/upload');

    // Verify the selected file.
    cy.get('.upload-card__file-name')
      .should('contain.text', 'authenticated-test.txt');

    // Verify the password is empty.
    cy.get('[formControlName="filePassword"]')
      .should('have.value', '');

    // Verify the default retention period.
    cy.get('[formControlName="retentionDays"]')
      .should('have.value', '2: 7');

    // Submit the upload.
    cy.get('button[type="submit"]').click();

    // Verify the real API response.
    cy.wait('@uploadFile').then(({ response }) => {
      expect(response?.statusCode).to.be.oneOf([201]);
    });

    // Retrieve the generated download token.
    cy.get('.upload-success__share-link')
      .should('be.visible')
      .invoke('text')
      .then((link) => {
        downloadToken = link.trim().split('/').pop()!;
      });
  });

  it('E2E-03 - should download the file', () => {
    // Clear the download folder.
    cy.task('clearDownloads', 'authenticated');

    // Open the generated download link.
    cy.visit(`/${downloadToken}`);

    // Verify the displayed file name.
    cy.get('.download-card__file-name')
      .should('contain.text', 'authenticated-test.txt');

    // Verify that no password is required.
    cy.get('[formControlName="password"]')
        .should('not.exist');

    // Trigger the download.
    cy.get('.download-card__button').click();

    // Verify the downloaded file content.
    cy.readFile('cypress/downloads/authenticated-test.txt', {
      timeout: 10000
    }).should(
      'eq',
      'Contenu du fichier de test DataShare authentifié.\n'
    );

  });

  it('E2E-04 - should upload a password-protected file when authenticated', () => {
    authenticate();

    cy.intercept('POST', '/api/auth/files').as('uploadFile');

    cy.visit('/');

    // Select a real file.
    cy.get('input[type="file"]')
      .selectFile('cypress/fixtures/authenticated-protected-test.txt', { force: true });

    // Verify navigation to the upload page.
    cy.location('pathname').should('eq', '/upload');

    // Verify the selected file.
    cy.get('.upload-card__file-name')
      .should('contain.text', 'authenticated-protected-test.txt');

    // Set the file password.
    cy.get('[formControlName="filePassword"]')
      .type(filePassword);

    // Verify the default retention period.
    cy.get('[formControlName="retentionDays"]')
      .should('have.value', '2: 7');

    // Submit the upload.
    cy.get('button[type="submit"]').click();

    // Verify the real API response.
    cy.wait('@uploadFile').then(({ response }) => {
      expect(response?.statusCode).to.be.oneOf([201]);
    });

    // Retrieve the generated download token.
    cy.get('.upload-success__share-link')
      .should('be.visible')
      .invoke('text')
      .then((link) => {
        downloadToken = link.trim().split('/').pop()!;
      });
  });

  it('E2E-05 - should download the password-protected file', () => {

    // Open the generated download link.
    cy.visit(`/${downloadToken}`);

    // Verify the displayed file name.
    cy.get('.download-card__file-name')
      .should('contain.text', 'authenticated-protected-test.txt');

    // Verify that the password is required.
    cy.get('[formControlName="password"]')
      .should('be.visible')
      .type(filePassword);

    // Trigger the download.
    cy.get('.download-card__button').click();

    // Verify the downloaded file content.
    cy.readFile('cypress/downloads/authenticated-protected-test.txt', {
      timeout: 10000
    }).should(
      'eq',
      'Contenu du fichier protégé de test DataShare authentifié.\n'
    );

    // Return to the home page using the DataShare logo.
    cy.get('.header__brand')
      .should('be.visible')
      .click();

  });

});