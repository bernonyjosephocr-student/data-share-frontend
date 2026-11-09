/*============= Validation & UI Constraints Properties =============*/
export const UI_CONSTRAINTS = Object.freeze({
  auth: {
    password: {
      minLength: 8,
      errorMinLength: 'Le mot de passe doit contenir au moins 8 caractères.'
    },
    email: {
      errorInvalid: 'Veuillez saisir une adresse email valide.'
    }
  },
  upload: {
    file: {
      maxSizeInBytes: 1073741824, // 1 Go
      forbiddenExtensions: ['.exe', '.bat', '.cmd', '.sh'],
      errorTooLarge: 'Le fichier dépasse la taille maximale autorisée (1000 Mo).',
      errorEmpty: 'Le fichier ne peut etre vide .',
      errorBadExtension: 'Ce format de fichier n\'est pas supporté.',
      password: {
        minLength: 6,
        errorMinLength: 'Le mot de passe doit contenir au moins 6 caractères.'
      }
    },
    retention: {
      minDays: 1,
      maxDays: 7,
      defaultDays: 7
    },
    tag: {
      maxLength: 30,
      minLength: 2,
      errorLength: 'Un tag est constitué d\'au moins 2 caractères et au plus 30 caractères.'
    }
  }
});

/*============= Type Export for complete IDE Autocomplete =============*/
export type UiConstraintsType = typeof UI_CONSTRAINTS;