/* ==========================================================================
 * Alcázar Chess — translations (Arabic · French · English) + RTL/LTR switching
 * t('key', {vars}, langOverride)   — '{name}' placeholders are replaced.
 * ========================================================================== */
window.AC = window.AC || {};

AC.i18n = (function () {
  const RTL = { ar: true, fr: false, en: false };
  const LS = 'ac_lang';
  let current = null;

  const D = { ar: {}, fr: {}, en: {} };

  /* ============================== ENGLISH ============================== */
  D.en = {
    'lang.ar': 'العربية', 'lang.fr': 'Français', 'lang.en': 'English',
    'lang.short.ar': 'عربية', 'lang.short.fr': 'FR', 'lang.short.en': 'EN',
    'welcome': 'Welcome to Alcázar Chess',
    'nav.home': 'Home', 'nav.logout': 'Log out',

    'common.group': 'Group', 'common.table': 'Table', 'common.white': 'White', 'common.black': 'Black',
    'common.round': 'Round', 'common.roundOf': 'Round {n} of {total}', 'common.points': 'Points', 'common.rank': 'Rank',
    'common.name': 'Name', 'common.elo': 'Elo', 'common.code': 'Access code', 'common.player': 'Player',
    'common.save': 'Save', 'common.cancel': 'Cancel', 'common.delete': 'Delete', 'common.confirm': 'Confirm',
    'common.back': 'Back', 'common.all': 'All', 'common.copy': 'Copy', 'common.copied': 'Copied ✓', 'common.retry': 'Retry',

    'landing.tagline': 'Competitive chess tournaments in Selouane, Morocco',
    'landing.description': 'Alcázar Chess is a chess club that organises competitive tournaments in Selouane — rapid games, Swiss-system rounds, two groups and a friendly, respectful atmosphere over a coffee.',
    'landing.place': 'Selouane, Morocco', 'landing.university': 'Near the university',
    'login.title': 'Participant login', 'login.name': 'Full name', 'login.namePh': 'Your full name',
    'login.code': 'Access code', 'login.codePh': 'e.g. ALC-1234', 'login.codeHint': 'The access code is given to you by the admin after payment.',
    'login.submit': 'Enter', 'login.error': 'Name or access code is incorrect.', 'login.adminLink': 'Admin', 'login.demo': 'Demo login',
    'admin.login.title': 'Admin login', 'admin.login.name': 'Admin name', 'admin.login.pass': 'Admin password',
    'admin.login.submit': 'Log in', 'admin.login.error': 'Wrong admin name or password.',

    'home.hello': 'Hello,', 'home.yourGame': 'Your game', 'home.vs': 'vs', 'home.bye': 'You have a bye this round.',
    'home.noGame': 'You are not in the current round’s pairings.',
    'home.tournament': 'Tournament', 'home.tournamentDesc': 'Live pairings — tables 1 to 6',
    'home.drinks': 'Order a drink', 'home.drinksDesc': 'Coffee Nisa menu — one drink each',
    'home.standings': 'Standings', 'home.standingsDesc': 'All players ranked by points',
    'home.results': 'Past results', 'home.resultsDesc': 'Recorded match results',
    'home.rules': 'Rules', 'home.rulesDesc': 'Game, conduct, timing and refunds',
    'home.cards': 'Yellow & red cards', 'home.cardsDesc': 'Who received a card, and why',

    'tournament.notStarted': 'Tournament not started', 'tournament.notDrawn': 'The draw has not been made yet. Pairings will appear here as soon as the admin runs it.',
    'tournament.you': 'You', 'tournament.banned': 'Suspended', 'tournament.byeNote': 'Bye (no opponent):',

    'drinks.subtitle': 'Coffee Nisa', 'drinks.limit': 'You can order only ONE drink. Once confirmed it cannot be changed.',
    'drinks.sugarLevel': 'Sugar level', 'drinks.confirmBtn': 'Confirm my order', 'drinks.confirmAsk': 'Order “{drink}”? You will not be able to order another drink.',
    'drinks.confirmed': 'Your order is confirmed', 'drinks.locked': 'Ordering is locked for this round. The waiter will bring your drink.',
    'drinks.none': 'No drinks are available right now.',
    'sugar.none': 'No sugar', 'sugar.low': 'Low sugar', 'sugar.medium': 'Medium sugar', 'sugar.sweet': 'Sweet',

    'standings.note': 'Ranked by total points (yellow cards already deducted). Ties: opponents’ points, then Elo.',
    'standings.empty': 'No players yet.',
    'results.sub': 'Recorded results of every completed round.', 'results.empty': 'No results recorded yet.',
    'results.noMatch': 'No matches match these filters.', 'results.forfeitNote': '* result by forfeit (opponent absent or suspended).',
    'results.draw': 'Draw', 'results.howTo': 'Tap the White side for a White win, the Black side for a Black win, or the table in the middle for a draw. Tap again to undo.',
    'results.absent': 'Absent', 'results.banForfeit': 'Suspended player — forfeit, opponent gets 1 point.',
    'results.progress': '{done} / {total} results entered', 'results.submit': 'Submit round results',
    'results.submitted': 'Results submitted', 'results.reopen': 'Re-open to correct', 'results.savedToast': 'Results saved — standings updated',

    'players.add': 'Add player', 'players.fullName': 'Full name', 'players.added': 'Player added', 'players.edit': 'Edit player',
    'players.newCode': 'New code', 'players.none': 'No players in this group yet.', 'players.withdraw': 'Withdraw from tournament',
    'players.reactivate': 'Reactivate', 'players.withdrawn': 'withdrawn', 'players.deleteAsk': 'Delete {name}?',

    'cards.yellow': 'Yellow cards', 'cards.red': 'Red cards', 'cards.none': 'No cards.', 'cards.noReason': 'No reason given',
    'cards.yellowNote': 'Each yellow card = −1 point. 2 yellow cards in one session = suspended from the next round.',
    'cards.choosePlayer': '— choose a player —', 'cards.reason': 'Reason', 'cards.reasonPh': 'e.g. mocking an opponent',
    'cards.issue': 'Issue card', 'cards.rule': 'A yellow card deducts 1 point automatically. A 2nd yellow card in the same Sunday session suspends the player from the next round (opponent gets 1 point).',
    'cards.yellowIssued': 'Yellow card issued (−1 point)', 'cards.redIssued': 'Red card issued',
    'cards.banTitle': 'Player suspended', 'cards.banBody': 'This is the 2nd yellow card of the session: the player is suspended from round {n}. The draw will give their opponent 1 point automatically.',
    'cards.history': 'Cards issued', 'cards.undo': 'Undo', 'cards.undoAsk': 'Remove this card? Its point deduction is cancelled.',

    'rules.sub': 'Please read carefully — rules apply to everyone.',
    'rules.sections': [
      { title: 'Game rules (Rapid — 10 minutes per player)', items: [
        'Time control: Rapid, 10 minutes for each player.',
        '1st illegal move / mistake: +2 minutes added to the opponent’s clock.',
        '2nd mistake: another +2 minutes added to the opponent’s clock.',
        '3rd mistake: direct loss of the game.',
        'These rules apply only when a player asks the arbiter/admin to enforce them. If both players agree to play without enforcing them, the arbiter does not intervene on mistakes.'] },
      { title: 'Organisation & conduct', items: [
        'Mutual respect is mandatory. No belittling or mocking of players because of their level.',
        'Any unethical behaviour = Yellow Card (−1 point) deducted from the cardholder’s points.',
        '2 Yellow Cards on the same day/session = banned from playing the next round, and the opponent is awarded 1 point.',
        'After finishing a game, players may watch in complete silence without interfering. Giving any hint or pointing at a move as a spectator = immediate Yellow Card.'] },
      { title: 'Group timing & punctuality', items: [
        'Format: 12 rounds in total over 4 weeks (every Sunday), 3 rounds each Sunday — Swiss system by points, not knockout.',
        'Group A (12 players) and Group B (12 players): 24 players maximum.',
        'When Group A finishes its last game of the 3rd round and the arbiter has recorded the results, Group A players must vacate their seats within 10 minutes  so Group B can sit and play.',
        'Late arrival: once the match has started, every minute of delay is deducted from the late player’s clock. Failing to show up counts as a loss and the opponent is awarded 1 point.'] },
      { title: 'Subscription & refunds (25 DH per day / 100 DH full tournament)', items: [
        'Subscription: 25 DH for a single day, or 100 DH for the full tournament.',
        'Any player who cannot attend their rounds can easily get a refund for that session.',
        ''] }
    ],

    'admin.tab.players': 'Players & draw', 'admin.tab.results': 'Match results', 'admin.tab.cards': 'Cards',
    'admin.tab.orders': 'Drink orders', 'admin.tab.settings': 'Settings', 'admin.draw': 'Draw',
    'draw.title': 'Swiss draw', 'draw.rule1': 'Round 1 pairs players by Elo inside each group (close ratings).',
    'draw.rule2': 'Rounds 2+ pair by points (leaders vs leaders), avoiding rematches and alternating colours.',
    'draw.done': 'Round {n} drawn — pairings are live', 'draw.finishFirst': 'Enter and submit the results of round {n} before drawing the next round.',
    'draw.redo': 'Re-draw round {n}', 'draw.redoAsk': 'Re-draw round {n}? Current pairings and any entered results will be replaced.',
    'draw.complete': 'The tournament is complete — all rounds are played.', 'draw.bansNext': 'Suspended for the next round',

    'orders.title': 'Drink orders (waiter view)', 'orders.stats': '{n} ordered · {w} not yet', 'orders.summary': 'Summary',
    'orders.byPlayer': 'By player', 'orders.drink': 'Drink', 'orders.sugar': 'Sugar', 'orders.none': 'No orders yet.',
    'orders.copy': 'Copy list', 'orders.download': 'Download .txt', 'orders.copyFail': 'Copy failed — use download', 'orders.exportLang': 'List language',
    'orders.sheetTitle': 'Order sheet — round {n}', 'orders.total': 'Total: {n} drinks',
    'orders.newRound': 'Open new ordering round', 'orders.newRoundAsk': 'Clear the current orders and let everyone order one drink again?', 'orders.newRoundDone': 'New ordering round opened',
    'orders.cancel': 'Cancel order', 'orders.cancelAsk': 'Cancel the order of {name}? They will be able to order again.',

    'settings.creds': 'Admin credentials', 'settings.credsNote': 'Change the default password before the tournament.', 'settings.saved': 'Saved ✓',
    'settings.menu': 'Drink menu', 'settings.hasSugar': 'takes sugar', 'settings.hide': 'Hide', 'settings.show': 'Show', 'settings.addDrink': 'Add a drink',
    'settings.data': 'Data & backup', 'settings.backend': 'Storage backend: {b}', 'settings.export': 'Export backup', 'settings.import': 'Import backup',
    'settings.importAsk': 'Replace ALL current data with this backup?', 'settings.loadDemo': 'Load demo data', 'settings.demoAsk': 'Replace everything with 24 demo players?',
    'settings.resetKeep': 'Reset tournament (keep players)', 'settings.resetAsk': 'Delete all pairings, results, cards and orders? Players are kept.',
    'settings.resetAll': 'Delete everything', 'settings.wipeAsk': 'Delete ALL data including players?',

    'err.backend': 'Could not reach the database. Check your connection and the backend settings.', 'err.sync': 'Could not save to the server — check your connection.',
    'err.nameRequired': 'Please enter a name.', 'err.eloInvalid': 'Elo must be a number between 0 and 3500.', 'err.groupInvalid': 'Choose group A or B.',
    'err.codeRequired': 'Please enter an access code.', 'err.codeTaken': 'This access code is already used.', 'err.groupFull': 'This group already has 12 players.',
    'err.notFound': 'Not found.', 'err.groupLocked': 'A player cannot change group after being paired.', 'err.hasMatches': 'This player has matches — withdraw them instead of deleting.',
    'err.cannotRedo': 'There is no open round to re-draw.', 'err.finishRound': 'Submit the current round’s results first.', 'err.tournamentComplete': 'All 12 rounds are done.',
    'err.notEnoughPlayers': 'Add at least 2 players to a group first.', 'err.roundLocked': 'This round is submitted — re-open it to edit.', 'err.noRound': 'No round to submit.',
    'err.incomplete': 'Enter a result for every table first.', 'err.playerRequired': 'Choose a player.', 'err.alreadyOrdered': 'You have already ordered a drink.',
    'err.drinkUnavailable': 'This drink is not available.', 'err.sugarRequired': 'Choose a sugar level.', 'err.badFile': 'Invalid backup file.',
    'err.adminCreds': 'Enter a name and a password of at least 4 characters.'
  };

  /* ============================== FRENCH ============================== */
  D.fr = {
    'lang.ar': 'العربية', 'lang.fr': 'Français', 'lang.en': 'English',
    'lang.short.ar': 'عربية', 'lang.short.fr': 'FR', 'lang.short.en': 'EN',
    'welcome': 'Bienvenue à Alcázar Chess',
    'nav.home': 'Accueil', 'nav.logout': 'Déconnexion',

    'common.group': 'Groupe', 'common.table': 'Table', 'common.white': 'Blancs', 'common.black': 'Noirs',
    'common.round': 'Ronde', 'common.roundOf': 'Ronde {n} sur {total}', 'common.points': 'Points', 'common.rank': 'Rang',
    'common.name': 'Nom', 'common.elo': 'Elo', 'common.code': 'Code d’accès', 'common.player': 'Joueur',
    'common.save': 'Enregistrer', 'common.cancel': 'Annuler', 'common.delete': 'Supprimer', 'common.confirm': 'Confirmer',
    'common.back': 'Retour', 'common.all': 'Tous', 'common.copy': 'Copier', 'common.copied': 'Copié ✓', 'common.retry': 'Réessayer',

    'landing.tagline': 'Tournois d’échecs compétitifs à Selouane, Maroc',
    'landing.description': 'Alcázar Chess est un club d’échecs qui organise des tournois compétitifs à Selouane : parties rapides, rondes au système suisse, deux groupes et une ambiance conviviale et respectueuse autour d’un café.',
    'landing.place': 'Selouane, Maroc', 'landing.university': 'Près de l’université',
    'login.title': 'Connexion participant', 'login.name': 'Nom complet', 'login.namePh': 'Votre nom complet',
    'login.code': 'Code d’accès', 'login.codePh': 'ex. ALC-1234', 'login.codeHint': 'Le code d’accès vous est remis par l’administrateur après paiement.',
    'login.submit': 'Entrer', 'login.error': 'Nom ou code d’accès incorrect.', 'login.adminLink': 'Admin', 'login.demo': 'Connexion démo',
    'admin.login.title': 'Connexion administrateur', 'admin.login.name': 'Nom de l’admin', 'admin.login.pass': 'Mot de passe admin',
    'admin.login.submit': 'Se connecter', 'admin.login.error': 'Nom ou mot de passe admin incorrect.',

    'home.hello': 'Bonjour,', 'home.yourGame': 'Votre partie', 'home.vs': 'contre', 'home.bye': 'Vous êtes exempt (bye) cette ronde.',
    'home.noGame': 'Vous ne figurez pas dans les appariements de la ronde en cours.',
    'home.tournament': 'Tournoi', 'home.tournamentDesc': 'Appariements en direct — tables 1 à 6',
    'home.drinks': 'Commander une boisson', 'home.drinksDesc': 'Menu Coffee Nisa — une boisson chacun',
    'home.standings': 'Classement', 'home.standingsDesc': 'Tous les joueurs classés par points',
    'home.results': 'Résultats passés', 'home.resultsDesc': 'Résultats des parties enregistrées',
    'home.rules': 'Règlement', 'home.rulesDesc': 'Jeu, conduite, horaires et remboursements',
    'home.cards': 'Cartons jaunes et rouges', 'home.cardsDesc': 'Qui a reçu un carton, et pourquoi',

    'tournament.notStarted': 'Tournoi pas encore commencé', 'tournament.notDrawn': 'Le tirage n’a pas encore eu lieu. Les appariements apparaîtront ici dès que l’admin le lancera.',
    'tournament.you': 'Vous', 'tournament.banned': 'Suspendu', 'tournament.byeNote': 'Exempt (sans adversaire) :',

    'drinks.subtitle': 'Coffee Nisa', 'drinks.limit': 'Vous ne pouvez commander qu’UNE seule boisson. Une fois confirmée, elle ne peut plus être modifiée.',
    'drinks.sugarLevel': 'Niveau de sucre', 'drinks.confirmBtn': 'Confirmer ma commande', 'drinks.confirmAsk': 'Commander « {drink} » ? Vous ne pourrez plus commander d’autre boisson.',
    'drinks.confirmed': 'Votre commande est confirmée', 'drinks.locked': 'Les commandes sont verrouillées pour cette ronde. Le serveur vous apportera votre boisson.',
    'drinks.none': 'Aucune boisson disponible pour le moment.',
    'sugar.none': 'Sans sucre', 'sugar.low': 'Peu sucré', 'sugar.medium': 'Moyen', 'sugar.sweet': 'Très sucré',

    'standings.note': 'Classé par points totaux (cartons jaunes déjà déduits). Départage : points des adversaires, puis Elo.',
    'standings.empty': 'Aucun joueur pour le moment.',
    'results.sub': 'Résultats enregistrés de chaque ronde terminée.', 'results.empty': 'Aucun résultat enregistré pour le moment.',
    'results.noMatch': 'Aucune partie ne correspond à ces filtres.', 'results.forfeitNote': '* résultat par forfait (adversaire absent ou suspendu).',
    'results.draw': 'Nulle', 'results.howTo': 'Touchez le côté Blancs pour une victoire des Blancs, le côté Noirs pour une victoire des Noirs, ou la table au centre pour une nulle. Touchez à nouveau pour annuler.',
    'results.absent': 'Absent', 'results.banForfeit': 'Joueur suspendu — forfait, l’adversaire reçoit 1 point.',
    'results.progress': '{done} / {total} résultats saisis', 'results.submit': 'Valider les résultats de la ronde',
    'results.submitted': 'Résultats validés', 'results.reopen': 'Rouvrir pour corriger', 'results.savedToast': 'Résultats enregistrés — classement mis à jour',

    'players.add': 'Ajouter un joueur', 'players.fullName': 'Nom complet', 'players.added': 'Joueur ajouté', 'players.edit': 'Modifier le joueur',
    'players.newCode': 'Nouveau code', 'players.none': 'Aucun joueur dans ce groupe.', 'players.withdraw': 'Retirer du tournoi',
    'players.reactivate': 'Réactiver', 'players.withdrawn': 'retiré', 'players.deleteAsk': 'Supprimer {name} ?',

    'cards.yellow': 'Cartons jaunes', 'cards.red': 'Cartons rouges', 'cards.none': 'Aucun carton.', 'cards.noReason': 'Aucun motif indiqué',
    'cards.yellowNote': 'Chaque carton jaune = −1 point. 2 cartons jaunes dans une même session = suspendu de la ronde suivante.',
    'cards.choosePlayer': '— choisir un joueur —', 'cards.reason': 'Motif', 'cards.reasonPh': 'ex. moquerie envers un adversaire',
    'cards.issue': 'Donner le carton', 'cards.rule': 'Un carton jaune retire 1 point automatiquement. Un 2e carton jaune lors de la même session du dimanche suspend le joueur de la ronde suivante (l’adversaire reçoit 1 point).',
    'cards.yellowIssued': 'Carton jaune donné (−1 point)', 'cards.redIssued': 'Carton rouge donné',
    'cards.banTitle': 'Joueur suspendu', 'cards.banBody': 'C’est le 2e carton jaune de la session : le joueur est suspendu de la ronde {n}. Le tirage donnera automatiquement 1 point à son adversaire.',
    'cards.history': 'Cartons donnés', 'cards.undo': 'Annuler', 'cards.undoAsk': 'Retirer ce carton ? La déduction de point sera annulée.',

    'rules.sub': 'À lire attentivement — le règlement s’applique à tous.',
    'rules.sections': [
      { title: 'Règles du jeu (Rapide — 10 minutes par joueur)', items: [
        'Cadence : Rapide, 10 minutes par joueur.',
        '1er coup illégal / erreur : +2 minutes ajoutées à la pendule de l’adversaire.',
        '2e erreur : encore +2 minutes ajoutées à la pendule de l’adversaire.',
        '3e erreur : perte directe de la partie.',
        'Ces règles ne s’appliquent que si un joueur demande à l’arbitre/admin de les faire respecter. Si les deux joueurs acceptent de jouer sans les appliquer, l’arbitre n’intervient pas en cas d’erreur.'] },
      { title: 'Organisation et conduite', items: [
        'Le respect mutuel est obligatoire. Aucune moquerie ni dénigrement des joueurs en raison de leur niveau.',
        'Tout comportement non éthique = Carton jaune (−1 point) déduit des points du joueur sanctionné.',
        '2 cartons jaunes le même jour/la même session = interdiction de jouer la ronde suivante, et l’adversaire reçoit 1 point.',
        'Après sa partie, un joueur peut regarder en silence complet sans intervenir. Donner un indice ou montrer un coup en tant que spectateur = carton jaune immédiat.'] },
      { title: 'Horaires des groupes et ponctualité', items: [
        'Format : 12 rondes au total sur 4 semaines (chaque dimanche), 3 rondes par dimanche — système suisse aux points, pas d’élimination directe.',
        'Groupe A (12 joueurs) et groupe B (12 joueurs) : 24 joueurs maximum.',
        'Quand le groupe A termine sa dernière partie de la 3e ronde et que l’arbitre a enregistré les résultats, les joueurs du groupe A doivent libérer leurs places sous 10 minutes  pour que le groupe B puisse s’installer et jouer.',
        'Retard : une fois la partie lancée, chaque minute de retard est déduite de la pendule du joueur en retard. Ne pas se présenter = défaite, et l’adversaire reçoit 1 point.'] },
      { title: 'Inscription et remboursements (25 DH par jour / 100 DH le tournoi complet)', items: [
        'Inscription : 25 DH pour une journée, ou 100 DH pour le tournoi complet.',
        'Tout joueur qui ne peut pas assister à ses rondes peut facilement se faire rembourser cette session.',
        ''] }
    ],

    'admin.tab.players': 'Joueurs et tirage', 'admin.tab.results': 'Résultats', 'admin.tab.cards': 'Cartons',
    'admin.tab.orders': 'Commandes', 'admin.tab.settings': 'Paramètres', 'admin.draw': 'Tirage',
    'draw.title': 'Tirage suisse', 'draw.rule1': 'La ronde 1 apparie les joueurs selon l’Elo dans chaque groupe (classements proches).',
    'draw.rule2': 'Dès la ronde 2 : appariement aux points (les premiers contre les premiers), sans revanche et avec alternance des couleurs.',
    'draw.done': 'Ronde {n} tirée — les appariements sont en ligne', 'draw.finishFirst': 'Saisissez et validez les résultats de la ronde {n} avant de tirer la suivante.',
    'draw.redo': 'Refaire le tirage de la ronde {n}', 'draw.redoAsk': 'Refaire le tirage de la ronde {n} ? Les appariements actuels et les résultats saisis seront remplacés.',
    'draw.complete': 'Le tournoi est terminé — toutes les rondes sont jouées.', 'draw.bansNext': 'Suspendus pour la prochaine ronde',

    'orders.title': 'Commandes de boissons (vue serveur)', 'orders.stats': '{n} commandées · {w} en attente', 'orders.summary': 'Récapitulatif',
    'orders.byPlayer': 'Par joueur', 'orders.drink': 'Boisson', 'orders.sugar': 'Sucre', 'orders.none': 'Aucune commande pour le moment.',
    'orders.copy': 'Copier la liste', 'orders.download': 'Télécharger .txt', 'orders.copyFail': 'Copie impossible — utilisez le téléchargement', 'orders.exportLang': 'Langue de la liste',
    'orders.sheetTitle': 'Bon de commande — ronde {n}', 'orders.total': 'Total : {n} boissons',
    'orders.newRound': 'Ouvrir un nouveau tour de commandes', 'orders.newRoundAsk': 'Effacer les commandes actuelles et laisser chacun commander à nouveau une boisson ?', 'orders.newRoundDone': 'Nouveau tour de commandes ouvert',
    'orders.cancel': 'Annuler la commande', 'orders.cancelAsk': 'Annuler la commande de {name} ? Il/elle pourra recommander.',

    'settings.creds': 'Identifiants admin', 'settings.credsNote': 'Changez le mot de passe par défaut avant le tournoi.', 'settings.saved': 'Enregistré ✓',
    'settings.menu': 'Menu des boissons', 'settings.hasSugar': 'avec sucre', 'settings.hide': 'Masquer', 'settings.show': 'Afficher', 'settings.addDrink': 'Ajouter une boisson',
    'settings.data': 'Données et sauvegarde', 'settings.backend': 'Stockage : {b}', 'settings.export': 'Exporter une sauvegarde', 'settings.import': 'Importer une sauvegarde',
    'settings.importAsk': 'Remplacer TOUTES les données actuelles par cette sauvegarde ?', 'settings.loadDemo': 'Charger les données démo', 'settings.demoAsk': 'Tout remplacer par 24 joueurs de démonstration ?',
    'settings.resetKeep': 'Réinitialiser le tournoi (garder les joueurs)', 'settings.resetAsk': 'Supprimer appariements, résultats, cartons et commandes ? Les joueurs sont conservés.',
    'settings.resetAll': 'Tout supprimer', 'settings.wipeAsk': 'Supprimer TOUTES les données, joueurs compris ?',

    'err.backend': 'Impossible de joindre la base de données. Vérifiez votre connexion et les paramètres.', 'err.sync': 'Enregistrement impossible sur le serveur — vérifiez votre connexion.',
    'err.nameRequired': 'Veuillez saisir un nom.', 'err.eloInvalid': 'L’Elo doit être un nombre entre 0 et 3500.', 'err.groupInvalid': 'Choisissez le groupe A ou B.',
    'err.codeRequired': 'Veuillez saisir un code d’accès.', 'err.codeTaken': 'Ce code d’accès est déjà utilisé.', 'err.groupFull': 'Ce groupe compte déjà 12 joueurs.',
    'err.notFound': 'Introuvable.', 'err.groupLocked': 'Un joueur ne peut plus changer de groupe après avoir été apparié.', 'err.hasMatches': 'Ce joueur a des parties — retirez-le plutôt que de le supprimer.',
    'err.cannotRedo': 'Aucune ronde ouverte à retirer.', 'err.finishRound': 'Validez d’abord les résultats de la ronde en cours.', 'err.tournamentComplete': 'Les 12 rondes sont terminées.',
    'err.notEnoughPlayers': 'Ajoutez d’abord au moins 2 joueurs dans un groupe.', 'err.roundLocked': 'Cette ronde est validée — rouvrez-la pour la modifier.', 'err.noRound': 'Aucune ronde à valider.',
    'err.incomplete': 'Saisissez d’abord un résultat pour chaque table.', 'err.playerRequired': 'Choisissez un joueur.', 'err.alreadyOrdered': 'Vous avez déjà commandé une boisson.',
    'err.drinkUnavailable': 'Cette boisson n’est pas disponible.', 'err.sugarRequired': 'Choisissez un niveau de sucre.', 'err.badFile': 'Fichier de sauvegarde invalide.',
    'err.adminCreds': 'Saisissez un nom et un mot de passe d’au moins 4 caractères.'
  };

  /* ============================== ARABIC ============================== */
  D.ar = {
    'lang.ar': 'العربية', 'lang.fr': 'Français', 'lang.en': 'English',
    'lang.short.ar': 'عربية', 'lang.short.fr': 'FR', 'lang.short.en': 'EN',
    'welcome': 'مرحباً بكم في Alcázar Chess',
    'nav.home': 'الرئيسية', 'nav.logout': 'تسجيل الخروج',

    'common.group': 'المجموعة', 'common.table': 'الطاولة', 'common.white': 'الأبيض', 'common.black': 'الأسود',
    'common.round': 'الجولة', 'common.roundOf': 'الجولة {n} من {total}', 'common.points': 'النقاط', 'common.rank': 'الترتيب',
    'common.name': 'الاسم', 'common.elo': 'التصنيف (Elo)', 'common.code': 'رمز الدخول', 'common.player': 'اللاعب',
    'common.save': 'حفظ', 'common.cancel': 'إلغاء', 'common.delete': 'حذف', 'common.confirm': 'تأكيد',
    'common.back': 'رجوع', 'common.all': 'الكل', 'common.copy': 'نسخ', 'common.copied': 'تم النسخ ✓', 'common.retry': 'إعادة المحاولة',

    'landing.tagline': 'بطولات شطرنج تنافسية في سلوان، المغرب',
    'landing.description': 'Alcázar Chess نادٍ للشطرنج ينظّم بطولات تنافسية في سلوان: مباريات سريعة، جولات بالنظام السويسري، مجموعتان، وأجواء ودّية ومحترمة حول فنجان قهوة.',
    'landing.place': 'سلوان، المغرب', 'landing.university': 'بالقرب من الجامعة',
    'login.title': 'دخول المشاركين', 'login.name': 'الاسم الكامل', 'login.namePh': 'اسمك الكامل',
    'login.code': 'رمز الدخول', 'login.codePh': 'ALC-1234', 'login.codeHint': 'يسلّمك المشرف رمز الدخول بعد الدفع.',
    'login.submit': 'دخول', 'login.error': 'الاسم أو رمز الدخول غير صحيح.', 'login.adminLink': 'المشرف', 'login.demo': 'دخول تجريبي',
    'admin.login.title': 'دخول المشرف', 'admin.login.name': 'اسم المشرف', 'admin.login.pass': 'كلمة سر المشرف',
    'admin.login.submit': 'تسجيل الدخول', 'admin.login.error': 'اسم المشرف أو كلمة السر غير صحيحة.',

    'home.hello': 'مرحباً،', 'home.yourGame': 'مباراتك', 'home.vs': 'ضد', 'home.bye': 'لديك راحة (Bye) في هذه الجولة.',
    'home.noGame': 'اسمك غير موجود في قرعة الجولة الحالية.',
    'home.tournament': 'البطولة', 'home.tournamentDesc': 'القرعة المباشرة — الطاولات من 1 إلى 6',
    'home.drinks': 'طلب مشروب', 'home.drinksDesc': 'قائمة Coffee Nisa — مشروب واحد لكل لاعب',
    'home.standings': 'الترتيب العام', 'home.standingsDesc': 'كل اللاعبين مرتّبين حسب النقاط',
    'home.results': 'نتائج المباريات السابقة', 'home.resultsDesc': 'نتائج المباريات المسجّلة',
    'home.rules': 'القوانين', 'home.rulesDesc': 'اللعب، السلوك، المواعيد والاسترجاع',
    'home.cards': 'البطاقات الصفراء والحمراء', 'home.cardsDesc': 'من حصل على بطاقة ولماذا',

    'tournament.notStarted': 'لم تبدأ البطولة بعد', 'tournament.notDrawn': 'لم تُجرَ القرعة بعد. ستظهر المواجهات هنا بمجرد أن يجريها المشرف.',
    'tournament.you': 'أنت', 'tournament.banned': 'موقوف', 'tournament.byeNote': 'راحة (بدون خصم):',

    'drinks.subtitle': 'Coffee Nisa', 'drinks.limit': 'يمكنك طلب مشروب واحد فقط. بعد التأكيد لا يمكن تغييره.',
    'drinks.sugarLevel': 'مستوى السكر', 'drinks.confirmBtn': 'تأكيد الطلب', 'drinks.confirmAsk': 'هل تطلب «{drink}»؟ لن تتمكن من طلب مشروب آخر.',
    'drinks.confirmed': 'تم تأكيد طلبك', 'drinks.locked': 'تم قفل الطلبات لهذه الجولة. سيحضر النادل مشروبك.',
    'drinks.none': 'لا توجد مشروبات متاحة حالياً.',
    'sugar.none': 'بدون سكر', 'sugar.low': 'سكر قليل', 'sugar.medium': 'سكر متوسط', 'sugar.sweet': 'محلّى',

    'standings.note': 'الترتيب حسب مجموع النقاط (بعد خصم البطاقات الصفراء). عند التعادل: نقاط الخصوم ثم التصنيف.',
    'standings.empty': 'لا يوجد لاعبون بعد.',
    'results.sub': 'نتائج مسجّلة لكل جولة منتهية.', 'results.empty': 'لا توجد نتائج مسجّلة بعد.',
    'results.noMatch': 'لا توجد مباريات مطابقة لهذه التصفية.', 'results.forfeitNote': '* نتيجة بالانسحاب (غياب الخصم أو إيقافه).',
    'results.draw': 'تعادل', 'results.howTo': 'اضغط على جهة الأبيض لفوز الأبيض، وجهة الأسود لفوز الأسود، والطاولة في الوسط للتعادل. اضغط مرة أخرى للتراجع.',
    'results.absent': 'غائب', 'results.banForfeit': 'لاعب موقوف — انسحاب، ويحصل الخصم على نقطة واحدة.',
    'results.progress': 'تم إدخال {done} / {total} نتيجة', 'results.submit': 'اعتماد نتائج الجولة',
    'results.submitted': 'تم اعتماد النتائج', 'results.reopen': 'إعادة الفتح للتصحيح', 'results.savedToast': 'تم حفظ النتائج — تم تحديث الترتيب',

    'players.add': 'إضافة لاعب', 'players.fullName': 'الاسم الكامل', 'players.added': 'تمت إضافة اللاعب', 'players.edit': 'تعديل اللاعب',
    'players.newCode': 'رمز جديد', 'players.none': 'لا يوجد لاعبون في هذه المجموعة.', 'players.withdraw': 'سحب من البطولة',
    'players.reactivate': 'إعادة التفعيل', 'players.withdrawn': 'منسحب', 'players.deleteAsk': 'حذف {name}؟',

    'cards.yellow': 'البطاقات الصفراء', 'cards.red': 'البطاقات الحمراء', 'cards.none': 'لا توجد بطاقات.', 'cards.noReason': 'بدون سبب مذكور',
    'cards.yellowNote': 'كل بطاقة صفراء = خصم نقطة واحدة. بطاقتان صفراوان في نفس الحصة = إيقاف عن الجولة التالية.',
    'cards.choosePlayer': '— اختر لاعباً —', 'cards.reason': 'السبب', 'cards.reasonPh': 'مثال: السخرية من خصم',
    'cards.issue': 'إصدار البطاقة', 'cards.rule': 'البطاقة الصفراء تخصم نقطة واحدة تلقائياً. البطاقة الصفراء الثانية في نفس حصة الأحد توقف اللاعب عن الجولة التالية (ويحصل خصمه على نقطة).',
    'cards.yellowIssued': 'تم إصدار بطاقة صفراء (−1 نقطة)', 'cards.redIssued': 'تم إصدار بطاقة حمراء',
    'cards.banTitle': 'تم إيقاف اللاعب', 'cards.banBody': 'هذه هي البطاقة الصفراء الثانية في الحصة: اللاعب موقوف عن الجولة {n}. ستمنح القرعة خصمه نقطة واحدة تلقائياً.',
    'cards.history': 'البطاقات الصادرة', 'cards.undo': 'تراجع', 'cards.undoAsk': 'إلغاء هذه البطاقة؟ سيُلغى خصم النقطة.',

    'rules.sub': 'يرجى القراءة بعناية — القوانين تسري على الجميع.',
    'rules.sections': [
      { title: 'قوانين اللعب (سريع — 10 دقائق لكل لاعب)', items: [
        'نظام اللعب: Rapid، 10 دقائق لكل لاعب.',
        'الخطأ أو النقلة غير القانونية الأولى: تُضاف دقيقتان (+2) إلى ساعة الخصم.',
        'الخطأ الثاني: تُضاف دقيقتان إضافيتان (+2) إلى ساعة الخصم.',
        'الخطأ الثالث: خسارة مباشرة للمباراة.',
        'تُطبَّق هذه القواعد فقط عندما يطلب أحد اللاعبين من الحكم/المشرف تطبيقها. إذا اتفق اللاعبان على اللعب دون تطبيقها، فلا يتدخل الحكم عند الأخطاء.'] },
      { title: 'التنظيم والسلوك', items: [
        'الاحترام المتبادل إلزامي. يُمنع الاستخفاف باللاعبين أو السخرية منهم بسبب مستواهم.',
        'أي سلوك غير أخلاقي = بطاقة صفراء (خصم نقطة واحدة من رصيد صاحب البطاقة).',
        'بطاقتان صفراوان في نفس اليوم/الحصة = المنع من اللعب في الجولة التالية، ويحصل الخصم على نقطة واحدة.',
        'بعد انتهاء المباراة يمكن للاعب المشاهدة في صمت تام دون أي تدخل. إعطاء أي تلميح أو الإشارة إلى نقلة كمتفرج = بطاقة صفراء فورية.'] },
      { title: 'توقيت المجموعات والالتزام بالمواعيد', items: [
        'نظام البطولة: 12 جولة في المجموع على مدى 4 أسابيع (كل يوم أحد)، 3 جولات كل أحد — بالنظام السويسري حسب النقاط وليس الإقصاء المباشر.',
        'المجموعة A (12 لاعباً) والمجموعة B (12 لاعباً): بحد أقصى 24 لاعباً.',
        'عندما تنهي المجموعة A آخر مباراة في الجولة الثالثة ويسجّل الحكم النتائج، على لاعبي المجموعة A إخلاء مقاعدهم خلال 10 دقائق  ليتمكن لاعبو المجموعة B من الجلوس واللعب.',
        'التأخر: بعد انطلاق المباراة يُخصم من ساعة اللاعب المتأخر كل دقيقة تأخير. وعدم الحضور يُحتسب خسارة ويحصل الخصم على نقطة واحدة.'] },
      { title: 'الاشتراك والاسترجاع (25 درهماً لليوم / 100 درهم للبطولة كاملة)', items: [
        'الاشتراك: 25 درهماً لليوم الواحد، أو 100 درهم للبطولة كاملة.',
        'أي لاعب لا يستطيع حضور جولاته يمكنه بسهولة استرجاع مبلغ تلك الحصة.',
        ''] }
    ],

    'admin.tab.players': 'اللاعبون والقرعة', 'admin.tab.results': 'نتائج المباريات', 'admin.tab.cards': 'البطاقات',
    'admin.tab.orders': 'طلبات المشروبات', 'admin.tab.settings': 'الإعدادات', 'admin.draw': 'قرعة',
    'draw.title': 'القرعة السويسرية', 'draw.rule1': 'الجولة 1: يُقرن اللاعبون حسب التصنيف (Elo) داخل كل مجموعة لتقارب المستويات.',
    'draw.rule2': 'من الجولة 2: القرعة حسب النقاط (المتصدّرون ضد المتصدّرين) مع تفادي إعادة المواجهات وتناوب الألوان.',
    'draw.done': 'تمت قرعة الجولة {n} — المواجهات متاحة مباشرة', 'draw.finishFirst': 'أدخل نتائج الجولة {n} واعتمدها قبل إجراء قرعة الجولة التالية.',
    'draw.redo': 'إعادة قرعة الجولة {n}', 'draw.redoAsk': 'إعادة قرعة الجولة {n}؟ ستُستبدل المواجهات الحالية وأي نتائج مدخلة.',
    'draw.complete': 'انتهت البطولة — لُعبت كل الجولات.', 'draw.bansNext': 'موقوفون عن الجولة القادمة',

    'orders.title': 'طلبات المشروبات (عرض النادل)', 'orders.stats': 'طلب {n} · لم يطلب {w}', 'orders.summary': 'الملخص',
    'orders.byPlayer': 'حسب اللاعب', 'orders.drink': 'المشروب', 'orders.sugar': 'السكر', 'orders.none': 'لا توجد طلبات بعد.',
    'orders.copy': 'نسخ القائمة', 'orders.download': 'تنزيل .txt', 'orders.copyFail': 'تعذّر النسخ — استعمل التنزيل', 'orders.exportLang': 'لغة القائمة',
    'orders.sheetTitle': 'قائمة الطلبات — الجولة {n}', 'orders.total': 'المجموع: {n} مشروب',
    'orders.newRound': 'فتح دورة طلبات جديدة', 'orders.newRoundAsk': 'مسح الطلبات الحالية والسماح للجميع بطلب مشروب واحد من جديد؟', 'orders.newRoundDone': 'تم فتح دورة طلبات جديدة',
    'orders.cancel': 'إلغاء الطلب', 'orders.cancelAsk': 'إلغاء طلب {name}؟ سيتمكن من الطلب مجدداً.',

    'settings.creds': 'بيانات دخول المشرف', 'settings.credsNote': 'غيّر كلمة السر الافتراضية قبل البطولة.', 'settings.saved': 'تم الحفظ ✓',
    'settings.menu': 'قائمة المشروبات', 'settings.hasSugar': 'يُقدَّم بالسكر', 'settings.hide': 'إخفاء', 'settings.show': 'إظهار', 'settings.addDrink': 'إضافة مشروب',
    'settings.data': 'البيانات والنسخ الاحتياطي', 'settings.backend': 'مكان التخزين: {b}', 'settings.export': 'تصدير نسخة احتياطية', 'settings.import': 'استيراد نسخة احتياطية',
    'settings.importAsk': 'استبدال كل البيانات الحالية بهذه النسخة الاحتياطية؟', 'settings.loadDemo': 'تحميل بيانات تجريبية', 'settings.demoAsk': 'استبدال كل شيء بـ 24 لاعباً تجريبياً؟',
    'settings.resetKeep': 'إعادة ضبط البطولة (مع إبقاء اللاعبين)', 'settings.resetAsk': 'حذف كل القرعات والنتائج والبطاقات والطلبات؟ يبقى اللاعبون.',
    'settings.resetAll': 'حذف كل شيء', 'settings.wipeAsk': 'حذف كل البيانات بما فيها اللاعبون؟',

    'err.backend': 'تعذّر الوصول إلى قاعدة البيانات. تحقق من الاتصال ومن إعدادات الخادم.', 'err.sync': 'تعذّر الحفظ على الخادم — تحقق من الاتصال.',
    'err.nameRequired': 'يرجى إدخال الاسم.', 'err.eloInvalid': 'يجب أن يكون التصنيف رقماً بين 0 و3500.', 'err.groupInvalid': 'اختر المجموعة A أو B.',
    'err.codeRequired': 'يرجى إدخال رمز الدخول.', 'err.codeTaken': 'رمز الدخول مستعمل من قبل.', 'err.groupFull': 'هذه المجموعة تضم 12 لاعباً بالفعل.',
    'err.notFound': 'غير موجود.', 'err.groupLocked': 'لا يمكن تغيير مجموعة لاعب بعد إدراجه في القرعة.', 'err.hasMatches': 'لهذا اللاعب مباريات — اسحبه بدل حذفه.',
    'err.cannotRedo': 'لا توجد جولة مفتوحة لإعادة قرعتها.', 'err.finishRound': 'اعتمد نتائج الجولة الحالية أولاً.', 'err.tournamentComplete': 'انتهت الجولات الـ 12.',
    'err.notEnoughPlayers': 'أضف لاعبَين على الأقل في مجموعة أولاً.', 'err.roundLocked': 'تم اعتماد هذه الجولة — أعد فتحها للتعديل.', 'err.noRound': 'لا توجد جولة لاعتمادها.',
    'err.incomplete': 'أدخل نتيجة لكل طاولة أولاً.', 'err.playerRequired': 'اختر لاعباً.', 'err.alreadyOrdered': 'لقد طلبت مشروباً بالفعل.',
    'err.drinkUnavailable': 'هذا المشروب غير متوفر.', 'err.sugarRequired': 'اختر مستوى السكر.', 'err.badFile': 'ملف النسخة الاحتياطية غير صالح.',
    'err.adminCreds': 'أدخل اسماً وكلمة سر من 4 أحرف على الأقل.'
  };

  /* ---------- engine ---------- */
  function lang() {
    if (current) return current;
    let l = null;
    try { l = localStorage.getItem(LS); } catch (e) { /* ignore */ }
    current = D[l] ? l : AC.config.DEFAULT_LANG;
    return current;
  }
  function setLang(l) {
    if (!D[l]) return;
    current = l;
    try { localStorage.setItem(LS, l); } catch (e) { /* ignore */ }
  }
  /** Applies <html lang dir> — the whole layout flips via CSS logical properties. */
  function apply() {
    const l = lang();
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    document.title = 'Alcázar Chess — ' + t('landing.tagline');
  }
  function get(key, l) { const v = D[l || lang()][key]; return v !== undefined ? v : D.en[key]; }
  function t(key, vars, l) {
    let s = get(key, l);
    if (s === undefined) return key;
    if (typeof s !== 'string') return s;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function drinkName(d, l) { const L = l || lang(); return (d.name && (d.name[L] || d.name.en || d.name.fr || d.name.ar)) || '?'; }

  return { t, get, lang, setLang, apply, drinkName, dict: D };
})();
