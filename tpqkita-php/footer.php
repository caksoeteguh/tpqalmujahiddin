        </div> <!-- End of Content Page Wrapper -->

        <!-- Footnote copyright disclaimer -->
        <footer class="mt-auto px-8 py-5 border-t border-slate-200 bg-white text-center text-xs text-slate-400 no-print flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>&copy; <?php echo date('Y'); ?> <strong><?php echo htmlspecialchars($tpq_name); ?></strong>. Semua hak cipta dilindungi.</span>
            <span class="font-semibold text-slate-400/80 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100"><?php echo htmlspecialchars($tpq_footer); ?></span>
        </footer>

    </main> <!-- End of Main Workspace Content Area -->

    <!-- Mobile Navigation Menu Dropdown overlay -->
    <div id="mobile-menu-overlay" class="hidden fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 no-print"></div>

    <script>
        // Toggle mobile responsive sidebar menu
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const sidebarDrawer = document.getElementById('sidebar-drawer');
        const menuOverlay = document.getElementById('mobile-menu-overlay');

        if (mobileToggle && sidebarDrawer && menuOverlay) {
            function toggleMenu() {
                sidebarDrawer.classList.toggle('hidden');
                sidebarDrawer.classList.toggle('fixed');
                sidebarDrawer.classList.toggle('inset-y-0');
                sidebarDrawer.classList.toggle('left-0');
                sidebarDrawer.classList.toggle('flex');
                menuOverlay.classList.toggle('hidden');
            }

            mobileToggle.addEventListener('click', toggleMenu);
            menuOverlay.addEventListener('click', toggleMenu);
        }
    </script>
</body>
</html>
