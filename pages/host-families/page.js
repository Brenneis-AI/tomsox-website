<script>
document.addEventListener('DOMContentLoaded', function() {
    const openButtons = document.querySelectorAll('.host-hero-btn-primary, .host-cta-btn');
    const modal = document.getElementById('host-form-modal');
    const closeBtn = document.getElementById('modal-close-host');
    
    // Open modal
    openButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
        });
    });
    
    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
});
</script>