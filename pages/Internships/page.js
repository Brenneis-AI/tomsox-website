/*
  File: page.js
  Page: Internships
  Section: Modal open/close and GHL form iframe management for Apply Now buttons
  Last Updated: 2026-03-08
*/

function init() {
    const container = document.querySelector('.internship-accordion-container');
    if (!container) return;

    const applyButtons = container.querySelectorAll('.apply-btn:not([disabled])');
    const modalOverlay = container.querySelector('#form-modal');
    const closeModalBtn = container.querySelector('#modal-close');
    const modalTitle = container.querySelector('#modal-internship-title');
    const formContainer = container.querySelector('#ghl-form-container');
    const baseFormUrl = 'https://link.tomsox.org/widget/form/ErqjcCIbp5rRwppGWey0';

    let currentInternship = '';
    let attemptCount = 0;
    const maxAttempts = 20;

    const tryToSelectDropdown = (iframe, internshipTitle) => {
        attemptCount++;
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const dropdown = iframeDoc.querySelector('select[name="contact.intern_position_applying_for"]') ||
                             iframeDoc.querySelector('select[name="intern_position_applying_for"]') ||
                             iframeDoc.querySelector('select#intern_position_applying_for') ||
                             iframeDoc.querySelector('select') ||
                             iframeDoc.querySelector('[data-field="intern_position_applying_for"]');

            if (dropdown) {
                const options = dropdown.querySelectorAll('option');
                for (let option of options) {
                    if (option.value === internshipTitle || option.textContent.trim() === internshipTitle) {
                        dropdown.value = option.value;
                        option.selected = true;
                        dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                        attemptCount = 0;
                        return true;
                    }
                }
            }
        } catch (e) {
            attemptCount = 0;
            return false;
        }

        if (attemptCount < maxAttempts) {
            setTimeout(() => tryToSelectDropdown(iframe, internshipTitle), 500);
        } else {
            attemptCount = 0;
        }
        return false;
    };

    const openModal = (internshipTitle) => {
        currentInternship = internshipTitle;
        attemptCount = 0;
        modalTitle.textContent = 'Apply for: ' + internshipTitle;

        const encodedTitle = encodeURIComponent(internshipTitle);
        const urlWithParam = baseFormUrl + '?contact.intern_position_applying_for=' + encodedTitle;

        formContainer.innerHTML = '<iframe src="' + urlWithParam + '" style="width:100%;height:100%;border:none;border-radius:4px" id="inline-ErqjcCIbp5rRwppGWey0" title="Internship Form"></iframe>';

        const iframe = formContainer.querySelector('iframe');
        iframe.addEventListener('load', function() {
            setTimeout(() => tryToSelectDropdown(iframe, internshipTitle), 1000);
        });

        modalOverlay.classList.add('active');
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        currentInternship = '';
        attemptCount = 0;
        setTimeout(() => {
            formContainer.innerHTML = '<iframe src="about:blank" style="width:100%;height:100%;border:none;border-radius:4px" id="inline-ErqjcCIbp5rRwppGWey0" title="Internship Form"></iframe>';
        }, 300);
    };

    applyButtons.forEach(button => {
        button.addEventListener('click', () => openModal(button.getAttribute('data-internship')));
    });

    closeModalBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
