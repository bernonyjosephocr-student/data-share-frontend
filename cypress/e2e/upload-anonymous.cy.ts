describe('Anonymous upload and download', () => {
    const filePassword = 'file-secret-123';
    let downloadToken: string;

  it('E2E-01 - should display the home page', () => {
    // Clear the download folder
    cy.task('clearDownloads', 'anonymous');

    cy.visit('/');

    cy.contains('.home-title', 'Tu veux partager un fichier ?')
      .should('be.visible');

    cy.get('.upload-button')
      .should('be.visible')
      .and('have.attr', 'aria-label', 'Partager un fichier');

     cy.contains('button, a', 'Se connecter').should('be.visible');
  });

  it('E2E-02 - should upload a file anonymously', () => {

    cy.intercept('POST', '/api/files').as('uploadFile');

    cy.visit('/');

    // Select a real file.
    cy.get('input[type="file"]')
        .selectFile('cypress/fixtures/anonymous-test.txt', { force: true });

    // Verify navigation to the upload page.
    cy.location('pathname').should('eq', '/upload');

    // Verify the selected file.
    cy.get('.upload-card__file-name')
        .should('contain.text', 'anonymous-test.txt');

    // Verify that no password is set.
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

    // Verify successful upload.
    cy.get('.upload-success__share-link')
        .should('be.visible');

    cy.get('.upload-success__share-link')
    .should('be.visible')
    .invoke('text')
    .then((link) => {
        downloadToken = link.trim().split('/').pop()!;
    });
  });

  it('E2E-03 - should download the file anonymously', () => {
    // Clear the download folder
    cy.task('clearDownloads', 'anonymous');

    // Open the generated download link.
    cy.visit(`/${downloadToken}`);

    // Verify the displayed file name.
    cy.get('.download-card__file-name')
        .should('contain.text', 'anonymous-test.txt');

    // Verify that no password is required.
    cy.get('[formControlName="password"]')
        .should('not.exist');

    // Trigger the download.
    cy.get('.download-card__button').click();

    // Verify the downloaded file content.
    cy.readFile('cypress/downloads/anonymous-test.txt', {
        timeout: 10000
    }).should(
        'eq',
        'Contenu du fichier de test DataShare anonyme.\n'
    );
    // Return to the home page using the DataShare logo.
    cy.get('.header__brand')
    .should('be.visible')
    .click();

    // Verify home page.
    cy.location('pathname').should('eq', '/');
    cy.get('.home-title').should('be.visible');
  });

    //Upload a file with a password -------------------------------------

  it('E2E-04 - should upload a secured file anonymously', () => {

    cy.intercept('POST', '/api/files').as('uploadFile');

    cy.visit('/');

    // Select a real file.
    cy.get('input[type="file"]')
        .selectFile('cypress/fixtures/anonymous-secured-test.txt', { force: true });

    // Verify navigation to the upload page.
    cy.location('pathname').should('eq', '/upload');

    // Verify the selected file.
    cy.get('.upload-card__file-name')
        .should('contain.text', 'anonymous-secured-test.txt');

    // Set the password.
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

    // Verify successful upload.
    cy.get('.upload-success__share-link')
        .should('be.visible');

    cy.get('.upload-success__share-link')
    .should('be.visible')
    .invoke('text')
    .then((link) => {
        downloadToken = link.trim().split('/').pop()!;
    });
  });


  it('E2E-05 - should download the password-protected file anonymously', () => {

    // Open the generated download link.
    cy.visit(`/${downloadToken}`);

    // Verify the displayed file name.
    cy.get('.download-card__file-name')
        .should('contain.text', 'anonymous-secured-test.txt');

    // Verify that password is required.
    cy.get('[formControlName="password"]')
        .should('be.visible')
        .type(filePassword);

    // Trigger the download.
    cy.get('.download-card__button').click();

    // Verify the downloaded file content.
    cy.readFile('cypress/downloads/anonymous-secured-test.txt', {
        timeout: 10000
    }).should(
        'eq',
        'Contenu du fichier protégé de test DataShare anonyme.\n'
    );

  });

});

