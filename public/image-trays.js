(() => {
	const imageParagraphSelector = '.page-content article > p';
	const overflowTolerance = 1;

	function isImageParagraph(paragraph) {
		let imageCount = 0;

		for (const node of paragraph.childNodes) {
			if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
				continue;
			}

			if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === 'IMG' || node.tagName === 'BR')) {
				if (node.tagName === 'IMG') {
					imageCount += 1;
				}

				continue;
			}

			return false;
		}

		return imageCount > 0;
	}

	function createButton(className, label, text) {
		const button = document.createElement('button');
		button.className = className;
		button.type = 'button';
		button.setAttribute('aria-label', label);
		button.textContent = text;
		return button;
	}

	function createImageTray(paragraph) {
		const images = [...paragraph.children].filter((child) => child.tagName === 'IMG');
		const tray = document.createElement('div');
		const previousButton = createButton(
			'image-tray__button image-tray__button--previous',
			'查看前面的图片',
			'<',
		);
		const nextButton = createButton(
			'image-tray__button image-tray__button--next',
			'查看后面的图片',
			'>',
		);
		const viewport = document.createElement('div');
		const items = document.createElement('div');

		tray.className = 'image-tray';
		viewport.className = 'image-tray__viewport';
		viewport.tabIndex = 0;
		viewport.setAttribute('aria-label', '图片列表');
		items.className = 'image-tray__items';
		items.append(...images);
		viewport.append(items);
		tray.append(previousButton, viewport, nextButton);
		paragraph.replaceWith(tray);

		const updateControls = () => {
			const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
			const isOverflowing = maxScrollLeft > overflowTolerance;
			const isAtStart = viewport.scrollLeft <= overflowTolerance;
			const isAtEnd = viewport.scrollLeft >= maxScrollLeft - overflowTolerance;

			tray.classList.toggle('image-tray--overflowing', isOverflowing);
			previousButton.hidden = !isOverflowing;
			nextButton.hidden = !isOverflowing;
			previousButton.disabled = !isOverflowing || isAtStart;
			nextButton.disabled = !isOverflowing || isAtEnd;
		};

		const scrollByViewport = (direction) => {
			viewport.scrollBy({
				left: direction * viewport.clientWidth * 0.8,
				behavior: 'smooth',
			});
		};

		previousButton.addEventListener('click', () => scrollByViewport(-1));
		nextButton.addEventListener('click', () => scrollByViewport(1));
		viewport.addEventListener('scroll', updateControls, { passive: true });

		if ('ResizeObserver' in window) {
			new ResizeObserver(updateControls).observe(viewport);
		}

		for (const image of images) {
			if (!image.complete) {
				image.addEventListener('load', updateControls, { once: true });
				image.addEventListener('error', updateControls, { once: true });
			}
		}

		requestAnimationFrame(updateControls);
	}

	function wrapStandaloneImageGroups() {
		for (const article of document.querySelectorAll('.page-content article')) {
			let imageGroup = [];

			const wrapImageGroup = () => {
				if (imageGroup.length === 0) {
					return;
				}

				const paragraph = document.createElement('p');
				article.insertBefore(paragraph, imageGroup[0]);
				paragraph.append(...imageGroup);
				imageGroup = [];
			};

			for (const child of [...article.children]) {
				if (child.tagName === 'IMG') {
					imageGroup.push(child);
				} else {
					wrapImageGroup();
				}
			}

			wrapImageGroup();
		}
	}

	function initializeImageTrays() {
		wrapStandaloneImageGroups();

		for (const paragraph of document.querySelectorAll(imageParagraphSelector)) {
			if (isImageParagraph(paragraph)) {
				createImageTray(paragraph);
			}
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeImageTrays, { once: true });
	} else {
		initializeImageTrays();
	}
})();
