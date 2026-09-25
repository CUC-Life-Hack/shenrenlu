(() => {
	const storageKey = 'shenrenlu-theme';
	const root = document.documentElement;
	const toggle = document.querySelector('.theme-toggle');
	const storedTheme = localStorage.getItem(storageKey);
	const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

	function applyTheme(theme) {
		root.dataset.theme = theme;
		if (!toggle) return;

		const darkThemeIsActive = theme === 'dark';
		toggle.setAttribute('aria-label', darkThemeIsActive ? '切换浅色模式' : '切换深色模式');
		toggle.setAttribute('title', darkThemeIsActive ? '切换浅色模式' : '切换深色模式');
		toggle.setAttribute('aria-pressed', String(darkThemeIsActive));
	}

	applyTheme(storedTheme || preferredTheme);

	toggle?.addEventListener('click', () => {
		const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
		localStorage.setItem(storageKey, nextTheme);
		applyTheme(nextTheme);
	});
})();