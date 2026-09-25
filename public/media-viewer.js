(() => {
	const mediaSelector = '.page-content img:not([no-view])';
	const galleryName = 'page-media';

	function initializeMediaViewer() {
		if (!window.Fancybox) {
			console.error('Fancybox failed to load; the media viewer is unavailable.');
			return;
		}

		const media = document.querySelectorAll(mediaSelector);

		if (media.length === 0) {
			return;
		}

		for (const image of media) {
			image.dataset.fancybox = galleryName;
			image.dataset.src = image.currentSrc || image.src;

			if (image.alt) {
				image.dataset.caption = image.alt;
			}
		}

		window.Fancybox.bind(`[data-fancybox="${galleryName}"]`, {
			Thumbs: {
				type: 'modern',
			},
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeMediaViewer, { once: true });
	} else {
		initializeMediaViewer();
	}
})();
