<?php
/**
 * header.php
 * En-tête commun à toutes les pages
 * Paramètre : $page_active (string) - nom de la page active pour la nav
 */
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion du patrimoine arboré – <?= htmlspecialchars($page_title ?? 'Accueil') ?></title>
    <link rel="stylesheet" href="/css/style.css">
    <?php if (!empty($extra_css)): ?>
        <?php foreach ($extra_css as $css): ?>
            <link rel="stylesheet" href="<?= $css ?>">
        <?php endforeach; ?>
    <?php endif; ?>
</head>
<body>

<header>
    <a href="/index.php" class="logo">Gestion du patrimoine arboré</a>
    <nav>
        <a href="/index.php"           class="<?= ($page_active ?? '') === 'accueil'    ? 'active' : '' ?>">Accueil</a>
        <a href="/ajouter.php"         class="<?= ($page_active ?? '') === 'ajouter'    ? 'active' : '' ?>">Ajouter un arbre</a>
        <a href="/inventaire.php"      class="<?= ($page_active ?? '') === 'inventaire' ? 'active' : '' ?>">Inventaire</a>
        <a href="/carte.php"           class="<?= ($page_active ?? '') === 'carte'      ? 'active' : '' ?>">Carte</a>
        <a href="/cluster.php"         class="<?= ($page_active ?? '') === 'cluster'    ? 'active' : '' ?>">Cluster</a>
    </nav>
</header>

<main>