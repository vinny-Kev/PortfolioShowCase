// Touch interaction handling
document.addEventListener('DOMContentLoaded', () => {
    // Handle touch interactions for certificates
    const certWrappers = document.querySelectorAll('.cert-wrapper');
    certWrappers.forEach(wrapper => {
        wrapper.addEventListener('touchstart', () => {
            // Remove touched class from all other wrappers
            certWrappers.forEach(w => w !== wrapper && w.classList.remove('touched'));
            wrapper.classList.toggle('touched');
        });
    });

    // Handle touch interactions for project buttons
    const projectBtns = document.querySelectorAll('.project-btn');
    projectBtns.forEach(btn => {
        btn.addEventListener('touchstart', () => {
            // Remove touched class from all other buttons
            projectBtns.forEach(b => b !== btn && b.classList.remove('touched'));
            btn.classList.toggle('touched');
        });
    });

    // Hide tooltips when touching outside
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.cert-wrapper') && !e.target.closest('.project-btn')) {
            document.querySelectorAll('.touched').forEach(el => {
                el.classList.remove('touched');
            });
        }
    });

    // Smooth scrolling for certificate gallery
    const certGallery = document.querySelector('.cert-gallery');
    if (certGallery) {
        let isScrolling = false;
        let startX;
        let scrollLeft;

        certGallery.addEventListener('touchstart', (e) => {
            isScrolling = true;
            startX = e.touches[0].pageX - certGallery.offsetLeft;
            scrollLeft = certGallery.scrollLeft;
        });

        certGallery.addEventListener('touchmove', (e) => {
            if (!isScrolling) return;
            e.preventDefault();
            const x = e.touches[0].pageX - certGallery.offsetLeft;
            const dist = (x - startX);
            certGallery.scrollLeft = scrollLeft - dist;
        });

        certGallery.addEventListener('touchend', () => {
            isScrolling = false;
        });
    }

    // Handle support panel interactions
    const supportPanel = document.querySelector('.side-support-panel');
    if (supportPanel) {
        let touchStartY;
        let isSwiping = false;

        supportPanel.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            isSwiping = true;
        });

        supportPanel.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            const touchY = e.touches[0].clientY;
            const diff = touchY - touchStartY;
            
            // Calculate new position
            const currentTransform = supportPanel.style.transform || 'translateY(95%)';
            const currentY = parseFloat(currentTransform.match(/translateY\(([-\d.]+)%\)/)[1]);
            let newY = Math.max(0, Math.min(95, currentY + (diff / window.innerHeight * 100)));
            
            supportPanel.style.transform = `translateY(${newY}%)`;
            touchStartY = touchY;
        });

        supportPanel.addEventListener('touchend', () => {
            isSwiping = false;
            const currentTransform = supportPanel.style.transform || 'translateY(95%)';
            const currentY = parseFloat(currentTransform.match(/translateY\(([-\d.]+)%\)/)[1]);
            
            // Snap to either fully open or closed
            if (currentY < 50) {
                supportPanel.style.transform = 'translateY(0)';
            } else {
                supportPanel.style.transform = 'translateY(95%)';
            }
        });
    }

    // Double-tap to close sidepanel
    const sidepanel = document.querySelector('.sidepanel');
    if (sidepanel) {
        let lastTap = 0;
        
        sidepanel.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                if (sidepanel.classList.contains('open')) {
                    sidepanel.classList.remove('open');
                }
                e.preventDefault();
            }
            
            lastTap = currentTime;
        });
    }
});