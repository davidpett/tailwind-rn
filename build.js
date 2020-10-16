'use strict';
const css = require('css');
const {util} = require('prettier');
const cssToReactNative = require('css-to-react-native').default;

const remToPx = value => `${Number.parseFloat(value) * 16}px`;

const getStyles = rule => {
	const styles = rule.declarations
		.filter(({property, value}) => {
			// Skip line-height utilities without units
			if (property === 'line-height' && !value.endsWith('rem')) {
				return false;
			}
			if (
				!property ||
				!value ||
				[
					'font-family',
					'font',
					'place-content',
					'box-shadow',
					'transform'
				].includes(property) ||
				`${property}: ${value}` === 'text-decoration: inherit' ||
				`${property}: ${value}` === 'border-color: currentColor'
			) {
				return false;
			}
			return true;
		})
		.map(({property, value}) => {
			if (value.endsWith('rem')) {
				return [property, remToPx(value)];
			}

			return [property, value];
		});

	return cssToReactNative(styles);
};

module.exports = source => {
	const {stylesheet} = css.parse(source);

	const styles = {};

	for (const rule of stylesheet.rules) {
		if (rule.type === 'rule') {
			for (const selector of rule.selectors) {
				if (
					selector.indexOf('.') === 0 &&
					selector.indexOf(':') === -1 &&
					selector.indexOf('.-') === -1
				) {
					const utility = selector.replace(/^\./, '').replace('\\/', '/');
					styles[utility] = getStyles(rule);
				}
			}
		}
	}

	// Additional styles that we're not able to parse correctly automatically
	styles.underline = {textDecorationLine: 'underline'};
	styles['line-through'] = {textDecorationLine: 'line-through'};
	styles['no-underline'] = {textDecorationLine: 'none'};

	return styles;
};
