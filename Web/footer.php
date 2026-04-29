<?php
/**
 * footer.php
 * Pied de page commun à toutes les pages
 */
?>
</main>

<footer>
    <span>Projet Big Data / IA / Web – 2026</span>
    <span class="footer-center">Système de Gestion du patrimoine arboré de Saint-Quentin</span>
    <span>© Tous droits réservés</span>
</footer>

<?php if (!empty($extra_js)): ?>
    <?php foreach ($extra_js as $js): ?>
        <script src="<?= $js ?>"></script>
    <?php endforeach; ?>
<?php endif; ?>

</body>
</html>